# E2E: Milestone ↔ Board sync

This document describes the two UI flows that verify **Milestone Screen ↔ Board Sync**: when story status changes on the milestone page, the board card moves to the same column; when a card is moved on the board, the milestone story status updates to match.

The same flows can be run either as Playwright tests (`npm run test:e2e`) or manually via the **Playwright MCP server** using the steps below. Screenshots are saved under `docs/screenshots/` when running the Playwright spec.

---

## Prerequisites

- App running (e.g. `npm run dev`) at `PLAYWRIGHT_BASE_URL` or `http://localhost:3000`.
- Admin session (log in as admin or use seeded session).
- At least one project with a milestone that has stories; for sync to be visible, those stories must have linked tasks (task has `storyId` set, e.g. after backfill).

---

## Flow 1: Milestone → Board

**Goal:** Changing a story’s status on the milestone screen updates the corresponding card’s column on the board.

### MCP steps

1. **Navigate to milestone page**  
   `browser_navigate`  
   - `url`: `https://www.burley.ai/admin/projects/<projectId>/milestones` (or your base URL + path).

2. **Capture state before change**  
   - `browser_snapshot` (optional: `filename`: `docs/e2e-milestone-before.md`).  
   - `browser_take_screenshot` with `filename`: `docs/screenshots/milestone-before.png`, `fullPage`: `true`.

3. **Change story status**  
   - Use `browser_snapshot` to get the page structure.  
   - Find the first story row and its status dropdown (ref for the `<select>` or trigger that opens the dropdown).  
   - `browser_select_option` with `ref` of the status dropdown, `values`: `["in-progress"]` (or the value that corresponds to “In Progress”).  
   - Or `browser_click` to open the dropdown, then click the “In Progress” option.

4. **Wait and go to board**  
   - Short wait (e.g. 1–2 seconds) for the PATCH to complete.  
   - `browser_navigate` to board: `url`: `https://www.burley.ai/admin/board` (or your base + `/admin/board`).

5. **Capture and assert**  
   - `browser_take_screenshot` with `filename`: `docs/screenshots/board-after-milestone-change.png`, `fullPage`: `true`.  
   - **Assert:** The card for that story appears in the **“In Progress”** column (same status as on the milestone screen).

---

## Flow 2: Board → Milestone

**Goal:** Moving a card on the board updates the linked story’s status on the milestone screen.

### MCP steps

1. **Navigate to board**  
   `browser_navigate`  
   - `url`: `https://www.burley.ai/admin/board`.

2. **Capture state before move**  
   - `browser_take_screenshot` with `filename`: `docs/screenshots/board-before.png`, `fullPage`: `true`.

3. **Move a card from “To Do” to “In Progress”**  
   - `browser_snapshot` to get refs for the card and the “In Progress” column.  
   - `browser_drag` with `startRef` = the task card in “To Do”, `endRef` = the “In Progress” column (or drop zone).  
   - If the board uses a different interaction (e.g. menu or button), use `browser_click` to open the menu and click “In Progress”.

4. **Wait and go to milestone page**  
   - Short wait for the move API to complete.  
   - `browser_navigate` to the same project’s milestone page: `.../admin/projects/<projectId>/milestones`.

5. **Capture and assert**  
   - `browser_take_screenshot` with `filename`: `docs/screenshots/milestone-after-board-change.png`, `fullPage`: `true`.  
   - **Assert:** The story that corresponds to the moved card shows **“IN PROGRESS”** (or “In Progress”) on the milestone screen, identical to the board.

---

## Screenshots (after running Playwright spec)

| File | Description |
|------|-------------|
| `milestone-before.png` | Milestone page before changing story status (Flow 1). |
| `board-after-milestone-change.png` | Board after changing story to “In Progress” (Flow 1). |
| `board-before.png` | Board before dragging a card (Flow 2). |
| `milestone-after-board-change.png` | Milestone page after moving card to “In Progress” (Flow 2). |

Screenshots are written to `docs/screenshots/` when running:

```bash
npm run test:e2e -- e2e/milestone-board-sync.spec.ts
```

---

## Playwright MCP tools reference

- **browser_navigate** – Open milestone or board URL.
- **browser_snapshot** – Get accessibility snapshot (and optional markdown file) for refs and structure.
- **browser_take_screenshot** – Save PNG/JPEG (viewport or full page).
- **browser_click** – Click dropdown or option.
- **browser_select_option** – Select option(s) in a dropdown (ref + values).
- **browser_drag** – Drag card from one column to another (startRef, endRef).
