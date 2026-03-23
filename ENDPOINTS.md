# Burley.ai Admin API — Agent Endpoints

Base URL: `https://www.burley.ai/api/admin`

## Authentication

All endpoints require Bearer token auth:

```
Authorization: Bearer <MILESTONES_API_TOKEN>
X-Agent-Id: <agent-name>
```

The `X-Agent-Id` header identifies which agent performed the action (used in audit trails).

---

## Workflow Engine

Tasks follow a strict state machine. Invalid transitions return `400`.

```
backlog → todo → in_progress → review → qa → done
                     ↘ blocked ↙ (from backlog, todo, in_progress, review)
blocked → todo | in_progress | backlog
done → todo (reopen)
```

**Entry requirements:**
- `review` requires at least one artifact (PR link or output URL)
- `qa` requires actor role: `qa-agent`, `lead-agent`, or `admin`

---

## Board Types

Projects are organized into three boards via `boardType`:

| Value | Label | Purpose |
|-------|-------|---------|
| `client` | Clients | Paid client projects |
| `internal` | Products | Self-funded products |
| `ops` | Operations | Recurring ops work |

---

## Projects

### GET /tasks/projects

List all projects with task rollups.

**Query params:**
- `boardType` (optional): `client` | `internal` | `ops` — filter by board

**Response:**
```json
{
  "projects": [
    {
      "id": "bouncer-cash",
      "clientName": "Cam Burley",
      "projectName": "Bouncer.cash",
      "boardType": "internal",
      "color": "#f59e0b",
      "milestones": [...],
      "taskCounts": {
        "total": 8,
        "done": 0,
        "inProgress": 0,
        "blocked": 1
      },
      "totalBudget": 0,
      "funded": 0
    }
  ]
}
```

---

## Tasks (Board Cards)

### GET /tasks

List tasks with optional filters.

**Query params:**
- `projectId` — filter by project
- `milestoneId` — filter by milestone
- `status` — filter by status: `backlog` | `todo` | `in_progress` | `review` | `qa` | `done` | `blocked`
- `assignee` — filter by assignee

**Response:**
```json
{
  "tasks": [
    {
      "id": "TASK-001",
      "title": "Account sync — pull transactions into Firestore",
      "projectId": "bouncer-cash",
      "storyId": "abc123",
      "milestoneId": "bouncer-m1",
      "status": "backlog",
      "priority": "medium",
      "tags": ["plaid-integration"],
      "description": "",
      "hours": null,
      "assignee": null,
      "owner": null,
      "artifacts": [],
      "createdAt": "2026-03-23T...",
      "updatedAt": "2026-03-23T..."
    }
  ]
}
```

### POST /tasks

Create a new task.

**Body:**
```json
{
  "title": "Implement feature X",
  "projectId": "bouncer-cash",
  "priority": "high",
  "status": "backlog",
  "tags": ["feature"],
  "description": "Details here",
  "hours": 4,
  "milestoneId": "bouncer-m1",
  "storyId": "optional-story-id",
  "actor": "bob"
}
```

**Required:** `title`, `projectId`

### GET /tasks/:taskId

Get a single task with full history.

**Response:**
```json
{
  "task": { ... },
  "history": [
    {
      "actor": "bob",
      "event": "moved",
      "details": { "from": "backlog", "to": "todo" },
      "timestamp": "2026-03-23T..."
    }
  ]
}
```

### PATCH /tasks/:taskId

Update task fields.

**Body:** Any subset of task fields:
```json
{
  "title": "Updated title",
  "priority": "high",
  "tags": ["new-tag"],
  "description": "Updated description",
  "hours": 8,
  "assignee": "bob",
  "owner": "cam"
}
```

### DELETE /tasks/:taskId

Delete a task and its history.

---

## Task Actions

### POST /tasks/:taskId/move

Move a task to a new status. Validates against the workflow engine.

**Body:**
```json
{
  "status": "todo",
  "actor": "bob"
}
```

**Valid statuses:** `backlog`, `todo`, `in_progress`, `review`, `qa`, `done`, `blocked`

**Errors:**
- `400` if transition is invalid (see workflow rules above)
- `400` if entry requirements not met (e.g., review without artifact)

### POST /tasks/:taskId/block

Block a task with a reason.

**Body:**
```json
{
  "reason": "Waiting on Cam to upload bank PDFs",
  "actor": "bob"
}
```

### POST /tasks/:taskId/claim

Claim a task (assign yourself).

**Body:**
```json
{
  "actor": "bob",
  "confidence": 0.9
}
```

### POST /tasks/:taskId/comment

Add a comment to a task's history.

**Body:**
```json
{
  "actor": "bob",
  "content": "Started working on this. ETA 2 hours."
}
```

### POST /tasks/:taskId/artifact

Attach an artifact (PR, URL, file).

**Body:**
```json
{
  "type": "github_pr",
  "url": "https://github.com/camburley/interface/pull/1",
  "label": "Feature PR"
}
```

**Artifact types:** `github_pr`, `url`, `file`, `screenshot`, `other`

### POST /tasks/:taskId/complete

Mark a task as complete with evidence.

**Body:**
```json
{
  "evidence": "All tests passing, deployed to prod",
  "confidence": 1.0
}
```

### POST /tasks/:taskId/split

Split a task into subtasks.

**Body:**
```json
{
  "subtasks": [
    { "title": "Part 1: Backend", "priority": "high" },
    { "title": "Part 2: Frontend", "priority": "medium" }
  ]
}
```

---

## Milestones

### GET /milestones

List milestones.

**Query params:**
- `projectId` — filter by project

### POST /milestones

Create a milestone.

**Body:**
```json
{
  "projectId": "bouncer-cash",
  "title": "M1: Plaid Integration",
  "description": "Connect bank accounts via Plaid",
  "amount": 0,
  "fundingSource": "self-funded",
  "status": "draft"
}
```

### GET /milestones/:milestoneId

Get a single milestone.

### GET /milestones/:milestoneId/stories

List stories under a milestone.

### PATCH /milestones/:milestoneId/stories/:storyId

Update a story.

**Body:**
```json
{
  "status": "in-progress",
  "notes": "Working on it"
}
```

**Story statuses:** `todo`, `in-progress`, `review`, `done`, `blocked`

---

## Utility Endpoints

### POST /ensure-tasks-for-stories

Auto-create board tasks for any stories that don't have one.

### POST /sync-task-status-from-stories

Sync task statuses from their linked story statuses.

### POST /backfill-task-story-id

Backfill `storyId` on tasks that are missing it.

---

## Common Patterns for Agents

### Move a task through the full pipeline

```bash
# backlog → todo
curl -X POST .../tasks/TASK-001/move -d '{"status":"todo","actor":"bob"}'

# todo → in_progress
curl -X POST .../tasks/TASK-001/move -d '{"status":"in_progress","actor":"bob"}'

# Attach artifact (required before review)
curl -X POST .../tasks/TASK-001/artifact -d '{"type":"github_pr","url":"...","label":"PR"}'

# in_progress → review
curl -X POST .../tasks/TASK-001/move -d '{"status":"review","actor":"bob"}'

# review → qa (requires qa-agent or admin role)
curl -X POST .../tasks/TASK-001/move -d '{"status":"qa","actor":"admin"}'

# qa → done
curl -X POST .../tasks/TASK-001/move -d '{"status":"done","actor":"admin"}'
```

### Get all tasks for a board type

```bash
# Get internal product projects
curl .../tasks/projects?boardType=internal

# Then get tasks for a specific project
curl .../tasks?projectId=polymarket-bot
```

### Block and unblock

```bash
# Block
curl -X POST .../tasks/TASK-030/block -d '{"reason":"Waiting on bank PDFs","actor":"bob"}'

# Unblock → move back to todo or in_progress
curl -X POST .../tasks/TASK-030/move -d '{"status":"todo","actor":"bob"}'
```
