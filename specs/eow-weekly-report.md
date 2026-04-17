# EOW Weekly Report: Email + Client Portal Page

## Overview

Build a weekly progress report system with two outputs:
1. **Resend themed email** (forwardable, no login required, team-shareable)
2. **Client portal page** at `/client/reports` (auth-gated, clickable task details, video playback)

The email is the primary delivery. It links to the portal page for deeper exploration.

## 1. Weekly Report Email (Resend)

### Template: `weekly_report`

Add a new template type to `lib/email.ts` using the existing `brandedHtml()` wrapper and component helpers (`emailHeading`, `emailCard`, `emailSectionLabel`, `emailButton`, `emailStatusBadge`, `emailStep`, `emailNextUp`, `emailParagraph`).

### Email Sections

**Header:**
- BURLEY branded header (existing)
- Heading: "WEEKLY REPORT" (Bebas Neue)
- Tag: "WEEK {N} / {PROJECT NAME}"
- Date range: "Apr 14 - 17, 2026"

**Completed This Week:**
- For each task completed this week (completedAt within the date range):
  - Task ID + title in an `emailCard`
  - Completion date badge
  - One-line description pulled from the task's GitHub PR body or task description
  - Links to artifacts: PR link, Loom video, deploy URL (use `emailButton` secondary style)
  - If artifact type is "loom", show a thumbnail/play button linking to the Loom URL

**Cumulative Progress:**
- Progress fraction: "13 / 37 tasks complete"
- Visual: Use a table-based progress bar (inline CSS, email-safe)
  - Filled portion uses ACCENT color
  - Show percentage text
- Stats row: Completed | Remaining | This Week (+N)

**Blocked / At Risk:**
- If any tasks have status "blocked": list them with `emailStatusBadge("Blocked", RED)`
- If none: `emailStatusBadge("All Clear", GREEN)` with "No blockers this week."

**Up Next:**
- Next 3-4 tasks in the todo queue (ordered by position)
- Each as a numbered row: task ID, title
- Use `emailStep` component

**Timeline Note:**
- Static text block:
  "Each task takes up to 48 hours once started. Timeline is fluid and adapts to evolving requirements. We prioritize shipping quality work at a sustainable pace."
- Do NOT include "days to launch" or any fixed deadline language.

**CTA Buttons:**
- "View Full Report" -> `/client/reports` (primary)
- "View Board" -> `/client/board` (secondary)

**Footer:**
- Existing branded footer (Dashboard, Board, Email preferences, cam@burley.ai)

### Data Source

Create `lib/weekly-report.ts`:

```typescript
interface WeeklyReportData {
  clientName: string
  projectName: string
  projectId: string
  weekNumber: number
  dateRange: { start: string; end: string }
  completedThisWeek: TaskWithArtifacts[]
  totalDone: number
  totalTasks: number
  blocked: Task[]
  upNext: Task[]
}
```

Query logic:
- `completedThisWeek`: tasks where `projectId` matches AND `status === "done"` AND `completedAt` falls within the week range
- `totalDone` / `totalTasks`: count all tasks for the project
- `blocked`: tasks where `status === "blocked"`
- `upNext`: tasks where `status === "todo"`, ordered by `position`, limit 4
- For each completed task, include `artifacts` array from the task doc
- For GitHub PR descriptions: pull from artifacts with type `github_pr` (the URL contains the PR info)

### API Endpoint

`POST /api/admin/reports/weekly`

```json
{
  "projectId": "dme-engine",
  "sendEmail": true,      // optional, default false (preview only)
  "weekOverride": null     // optional, ISO date to anchor the week
}
```

Response:
```json
{
  "report": { ...WeeklyReportData },
  "html": "<rendered email HTML>",
  "sent": false
}
```

When `sendEmail: true`:
- Look up the client doc linked to `projectId` (via `milestone_projects` or `clients` collection where `milestoneProjectId === projectId`)
- Send to client email
- BCC bob@burley.ai (existing pattern)

### Email Preferences

Add `weeklySummary` to `EmailPreferences` (already exists as `false` default). Respect it before sending.

## 2. Client Portal Page: `/client/reports`

### Auth

Use existing `validateClientSession()` from `/client/board`. Client can only see their own project's reports.

### Page Layout

Use the existing design system: IBM Plex Sans/Mono, Bebas Neue, monochrome + orange accent, sharp corners.

**Report List View** (`/client/reports`):
- List of weekly reports, most recent first
- Each row: Week number, date range, tasks completed count, "View" link
- If no reports yet: empty state

**Report Detail View** (`/client/reports/[weekId]`):
- Full report rendered with the same sections as the email
- But with interactive elements:
  - Click a task card to expand: shows full description, acceptance criteria, PR diff summary
  - Video artifacts play inline (Loom embeds, MP4 video tags)
  - PR links open in new tab
  - Progress bar is animated

### Data Storage

Store generated reports in Firestore `weekly_reports` collection:
```
weekly_reports/{auto-id}
  projectId: string
  weekNumber: number
  year: number
  dateRange: { start: Timestamp, end: Timestamp }
  generatedAt: Timestamp
  data: WeeklyReportData (serialized)
```

This allows the client portal to load historical reports without regenerating.

## 3. Video Per Task

Currently videos/Looms are stored as task artifacts. The report should show each task's videos individually, not one video for all tasks.

For each completed task in the report:
- Filter `task.artifacts` for types: `loom`, `screenshot`, `url` (if URL contains loom.com or .mp4)
- Display inline in both email (as linked thumbnail) and portal (as embedded player)

## 4. Implementation Notes

- Follow existing patterns in `lib/email.ts` exactly (inline styles, table-based layout, same color constants)
- The email must render correctly in Gmail, Apple Mail, and Outlook (table-based, no CSS grid/flex)
- Use existing Resend integration (same `send()` function, same FROM address)
- Add `weekly_report` to `TemplateKey` union and `DEFAULT_COPY` with editable subject/heading/body
- Add preview support in `/api/admin/emails` GET handler (same pattern as other templates)
- Progress percentage: `Math.round((totalDone / totalTasks) * 100)`

## 5. Future: Automation

After the manual trigger works, add a cron/scheduled function that:
- Runs every Friday at 5 PM ET
- For each active project with `weeklySummary: true`
- Generates and sends the report automatically

This is out of scope for v1. v1 is manual trigger via API + admin UI.
