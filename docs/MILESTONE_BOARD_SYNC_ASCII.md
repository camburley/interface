# Milestone Screen ↔ Board Sync — ASCII Map

## Current state (out of sync)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ MILESTONE SCREEN (e.g. /admin/projects/dolceright-mobile-app/milestones)         │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Data: MilestoneProject from getProjectWithMilestones(projectId)                  │
│        → Firebase: milestone_projects + milestones + STORIES                     │
│                                                                                  │
│  User changes dropdown: TODO → IN PROGRESS                                       │
│    → updateStoryStatus(milestoneId, storyId, "in-progress")                      │
│    → setProject(...) local state                                                 │
│    → PATCH /api/admin/milestones/[m]/stories/[storyId]  { status }               │
│    → Firebase: stories.doc(storyId).update({ status })     ◄── ONLY HERE         │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ no link
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ BOARD (/admin/board)                                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Data: tasks from db.collection("tasks").get()                                   │
│        → Firebase: TASKS only (separate collection)                              │
│                                                                                  │
│  Cards are placed by task.status (backlog | todo | in_progress | review | …)     │
│  Drag/drop → POST /api/admin/tasks/[taskId]/move  { status }                      │
│    → Firebase: tasks.doc(taskId).update({ status })         ◄── ONLY HERE        │
│                                                                                  │
│  Migration script copied stories → tasks once (with originalStoryId in history   │
│  subcollection only). No ongoing sync.                                           │
└─────────────────────────────────────────────────────────────────────────────────┘

  RESULT: Two sources of truth. Milestone status changes never touch tasks.
```

---

## Target: one logical source of truth, both UIs in sync

**Idea:** Keep both collections. For milestone-backed work, **dual-write** so that:
- Changing status on the **milestone screen** updates the **story** and the **linked task**.
- Changing status on the **board** (drag) updates the **task** and the **linked story** (if any).

Link: tasks that came from (or are tied to) a story must store **storyId** so we can find the story when the board moves the card, and find the task when the milestone screen changes the story.

---

## Status mapping (StoryStatus ↔ TaskStatus)

```
  STORY (milestone)          TASK (board)
  ─────────────────          ────────────
  todo                    →  todo
  in-progress              →  in_progress
  review                   →  review
  done                     →  done
  blocked                  →  blocked

  (task-only: backlog, qa — map to todo or leave task-only)
```

Use a single mapping object both ways (story → task and task → story for the 5 shared statuses).

---

## ASCII: End-to-end sync flow

```
                    ┌──────────────────────────────────────────────────────────┐
                    │                    FIREBASE                               │
                    │  ┌─────────────┐         ┌─────────────┐                  │
                    │  │  stories     │         │  tasks      │                  │
                    │  │  .doc(id)   │         │  .doc(id)   │                  │
                    │  │  status     │         │  status     │                  │
                    │  │             │  link   │  storyId?   │  ◄── add field   │
                    │  └──────┬──────┘ ──────► └──────┬──────┘                  │
                    └─────────┼───────────────────────┼─────────────────────────┘
                              │                       │
         Milestone screen     │                       │    Board
         updates story        │                       │    moves card
                              │                       │
┌─────────────────────────────▼───────────────────────▼─────────────────────────┐
│                                                                               │
│  PATH 1: User changes status on MILESTONE SCREEN                               │
│  ─────────────────────────────────────────────                                │
│                                                                               │
│    [Dropdown: TODO → IN PROGRESS]                                             │
│              │                                                                 │
│              ▼                                                                 │
│    PATCH /api/admin/milestones/[m]/stories/[storyId]  { status: "in-progress" }│
│              │                                                                 │
│              ▼                                                                 │
│    ┌─────────────────────────────────────────────────────────┐                │
│    │  stories.doc(storyId).update({ status, completedAt })   │                │
│    └─────────────────────────────────────────────────────────┘                │
│              │                                                                 │
│              │  NEW: find task(s) linked to this story                         │
│              │      query: tasks.where("storyId", "==", storyId)               │
│              ▼                                                                 │
│    ┌─────────────────────────────────────────────────────────┐                │
│    │  For each task: taskStatus = storyStatusToTask(status)   │                │
│    │  tasks.doc(task.id).update({ status: taskStatus, ... })  │                │
│    └─────────────────────────────────────────────────────────┘                │
│              │                                                                 │
│              ▼                                                                 │
│    Board (if open) shows updated card in "In Progress" column                 │
│    (either via refetch or real-time listener).                                 │
│                                                                               │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  PATH 2: User drags card on BOARD                                             │
│  ─────────────────────────────────                                            │
│                                                                               │
│    [Drag card to "In Progress" column]                                        │
│              │                                                                 │
│              ▼                                                                 │
│    POST /api/admin/tasks/[taskId]/move  { status: "in_progress" }              │
│              │                                                                 │
│              ▼                                                                 │
│    ┌─────────────────────────────────────────────────────────┐                │
│    │  tasks.doc(taskId).update({ status, completedAt, ... })   │                │
│    └─────────────────────────────────────────────────────────┘                │
│              │                                                                 │
│              │  NEW: if task.storyId is set                                     │
│              ▼                                                                 │
│    ┌─────────────────────────────────────────────────────────┐                │
│    │  storyStatus = taskStatusToStory(status)                   │                │
│    │  stories.doc(task.storyId).update({ status: storyStatus }) │                │
│    └─────────────────────────────────────────────────────────┘                │
│              │                                                                 │
│              ▼                                                                 │
│    Milestone screen (if open) shows same story as "IN PROGRESS"                │
│    (either via refetch or real-time listener).                                 │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation checklist (high level)

```
  [ ] 1. Task type + Firebase
        - Add optional storyId?: string to Task (lib/types/task.ts).
        - Migration or backfill: for existing tasks created from stories,
          set task.storyId from history subcollection (originalStoryId) or
          from (milestoneId + title) match to stories.

  [ ] 2. Story PATCH API (milestone → board)
        - In app/api/admin/milestones/[milestoneId]/stories/[storyId]/route.ts
          after updating the story doc:
        - Query: tasks.where("storyId", "==", storyId).get()
        - For each task doc, map body.status (StoryStatus) → TaskStatus and
          update task doc (status, completedAt, updatedAt). Optionally append
          history.

  [ ] 3. Task move API (board → milestone)
        - In app/api/admin/tasks/[taskId]/move/route.ts after updating the task:
        - If task has storyId, fetch stories.doc(task.storyId), map new status
          (TaskStatus) → StoryStatus, update story doc (status, completedAt).

  [ ] 4. New stories → tasks
        - When a new story is created (POST .../stories), either:
          a) Also create a task with storyId = story.id and same status; or
          b) Rely on a single “sync stories to board” action or migration.
        - When creating a task from the board for a milestone, set storyId if
          it’s created from a milestone story (e.g. “Add to board” from
          milestone screen could create task with storyId).

  [ ] 5. Board / Milestone UI refresh
        - Board: either refetch tasks after a move or use a store that
          invalidates when returning from milestone page; optional Firestore
          listener for tasks.
        - Milestone: project is loaded server-side; after updateStoryStatus
          the local state is already updated; board gets new data on next
          load or via listener. No change required for milestone screen
          except ensuring the PATCH API does the dual-write.
```

---

## File touch map

```
  lib/types/task.ts
    → Task: add storyId?: string

  app/api/admin/milestones/[milestoneId]/stories/[storyId]/route.ts
    → PATCH: after ref.update(updates), query tasks by storyId, update task status

  app/api/admin/tasks/[taskId]/move/route.ts
    → POST: after ref.update(updates), if task.storyId, update stories.doc(storyId)

  lib/sync-status.ts (new, optional)
    → storyStatusToTask(status: StoryStatus): TaskStatus
    → taskStatusToStory(status: TaskStatus): StoryStatus

  scripts/migrate-stories-to-tasks.ts (or new backfill)
    → When creating task from story, set storyId: storyDoc.id on the task doc.
```

---

## Summary diagram

```
                    MILESTONE SCREEN                    BOARD
                    ────────────────                    ─────
                          │                                  │
                          │ PATCH story status               │ POST task move
                          ▼                                  ▼
                    ┌─────────────┐                    ┌─────────────┐
                    │ stories API │                    │ tasks/move  │
                    │ (update    │                    │ (update     │
                    │  story)    │                    │  task)      │
                    └─────┬──────┘                    └──────┬──────┘
                          │                                  │
                          │ dual-write                       │ dual-write
                          │ (storyId → task)                 │ (task.storyId → story)
                          ▼                                  ▼
                    ┌─────────────────────────────────────────────┐
                    │            Firebase (stories + tasks)        │
                    │            linked by task.storyId            │
                    └─────────────────────────────────────────────┘
```

Once both APIs perform their dual-write and tasks have `storyId` where applicable, milestone screen and board stay in sync.
