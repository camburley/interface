# Adversarial verification: Milestone–Board sync

**Sprint goal:** When changes from stories or tasks are made, they are reflected on the board and milestone screen identically.

**Verification date:** (Run after deployment and backfill.)

---

## Implementation summary

| Component | Status | Notes |
|-----------|--------|--------|
| `lib/sync-status.ts` | Done | `storyStatusToTaskStatus`, `taskStatusToStoryStatus` (incl. backlog→todo, qa→review). |
| `lib/types/task.ts` | Done | `storyId?: string` on Task. |
| Story PATCH API | Done | After updating story, queries tasks by `storyId` and updates their `status`, `updatedAt`, `completedAt`. |
| Task move API | Done | After updating task, if `task.storyId` set, updates story `status` and `completedAt`. |
| Backfill script | Done | `npx tsx scripts/backfill-task-story-id.ts` sets `task.storyId` from history `originalStoryId`. |
| Unit tests | Done | `__tests__/sync-status.test.ts`. |
| API tests | Done | `__tests__/api/milestone-story-sync.test.ts`, `__tests__/api/task-move-story-sync.test.ts`. |
| E2E spec | Done | `e2e/milestone-board-sync.spec.ts`; doc `docs/e2e-milestone-board-sync.md` (MCP steps). |

---

## Adversarial checks

Run these after the app is deployed and backfill has been run once.

### 1. Milestone → Board

- **Step:** On a milestone page, change one story’s status (e.g. TODO → IN PROGRESS) via the dropdown.
- **Expected:** The same story’s card on the board appears in the “In Progress” column.
- **Evidence:** Screenshot of milestone after change; screenshot of board showing the card in the correct column.
- **Pass/fail:** _____

### 2. Board → Milestone

- **Step:** On the board, drag a card that has a linked story (task has `storyId`) from “To Do” to “In Progress”.
- **Expected:** On the milestone page for that project, the corresponding story shows “IN PROGRESS”.
- **Evidence:** Screenshot of board after drag; screenshot of milestone showing the story in the correct status.
- **Pass/fail:** _____

### 3. Edge: Task with no `storyId`

- **Step:** Move a board-only task (no `storyId`) to another column.
- **Expected:** No story document is updated; no errors.
- **Pass/fail:** _____

### 4. Edge: Story with no linked task

- **Step:** Change a story’s status on the milestone when that story has no task with `storyId` pointing to it.
- **Expected:** Story updates; no errors; board unchanged for that story (no card or card stays where it was if it exists without link).
- **Pass/fail:** _____

### 5. Status mapping

- **Step:** For each story status (todo, in-progress, review, done, blocked), change on milestone and confirm board column; for task move to backlog/qa, confirm story gets todo/review.
- **Expected:** All mappings match the table in `docs/MILESTONE_BOARD_SYNC_ASCII.md` and `lib/sync-status.ts`.
- **Pass/fail:** _____

---

## How to run evidence collection

1. Start the app (`npm run dev` or production URL).
2. Run E2E (optional): `npm run test:e2e -- e2e/milestone-board-sync.spec.ts` — saves screenshots under `docs/screenshots/`.
3. Or use Playwright MCP: follow `docs/e2e-milestone-board-sync.md` (browser_navigate, browser_take_screenshot, etc.) and attach screenshots to this report.

---

## Verdict

- **Implementation meets sprint goal:** Yes / No / Partial.
- **Gaps (if any):** _____
- **Notes:** _____
