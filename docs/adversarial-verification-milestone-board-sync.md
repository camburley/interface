# Adversarial verification: Milestone–Board sync

**Sprint goal:** When changes from stories or tasks are made, they are reflected on the board and milestone screen identically.

**Verification date:** (Run after deployment and backfill.)

---

## Why sync might not show after deploy (and what was fixed)

Even with the plan implemented, the board can still show 0 In Progress / wrong counts if:

1. **Backfill used exact title match**  
   The backfill script used to match task↔story only when `title` was exactly equal. Any trim/case/encoding difference meant no `storyId` was set, so the story PATCH couldn’t find a task by `storyId`.  
   **Fix:** Backfill now uses normalized title (trim + lowercase) and optional fuzzy match. **Re-run backfill in production** after pulling:  
   `npx tsx scripts/backfill-task-story-id.ts`  
   (Use the same env as production, e.g. production Firebase.)

2. **Board showed stale data after navigating back**  
   Returning from the milestone page (e.g. back button or link) could show cached RSC, so the board didn’t refetch tasks.  
   **Fix:** Board now refetches tasks when the tab becomes visible (`visibilitychange`). Refresh or switch tab and back once if you don’t see updates.

3. **Failed PATCH was invisible**  
   If the story PATCH failed (network, 403, 500), the UI still updated optimistically and the user didn’t see an error.  
   **Fix:** Story status change now reverts the dropdown and shows a toast on non-ok response.

4. **Production Firebase ≠ backfill target**  
   If backfill was run only against local/dev Firebase, production tasks never got `storyId`.  
   **Fix:** Run the backfill script once in the environment that points at the same Firebase as the deployed app (e.g. Vercel env vars).

**Post-deploy checklist:**  
- [ ] Deploy latest (backfill script + API fallback + board visibility refetch + milestone error handling).  
- [ ] Run `pnpm run verify:sync` (or `npx tsx scripts/verify-milestone-board-sync.ts`) with **production** Firebase env — exit 0 means sync and board query work for that Firebase.  
- [ ] Run `npx tsx scripts/backfill-task-story-id.ts` with **production** Firebase env if verify:sync fails or tasks lack `storyId`.  
- [ ] Change a story on the milestone → open/refresh board (or switch tab and back) → confirm card in the right column.  
- [ ] Optional: In Vercel logs, look for `[milestone-story-sync] fallback matched` or `no task with matching title` to confirm dual-write path.

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
