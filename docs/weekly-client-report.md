# Weekly Client Report System

## Overview

The weekly client report system provides one shared data model with two delivery channels:

1. Auth-gated webpage: `/client/reports/weekly`
2. Resend email summary: `weekly_summary`

Both channels use the same aggregation logic in `lib/weekly-report.ts`.

## Data flow

### 1) Weekly aggregation source

`buildWeeklyReportForClient` in `lib/weekly-report.ts` composes:

- Tasks from `tasks` collection filtered by `projectId`
- Milestones from `milestones` collection to calculate active milestone progress
- Client metadata from `clients` collection
- Project metadata from `milestone_projects` collection
- PR detail enrichment from GitHub via `lib/github.ts`

### 2) GitHub PR enrichment

`lib/github.ts` adds:

- `parseGitHubPrUrl(url)` for URLs like `https://github.com/{owner}/{repo}/pull/{number}`
- `getPRDetails(owner, repo, prNumber)` with:
  - PR title/body
  - issue comments
  - review comments
  - commit messages
- Firestore cache in `github_pr_cache` with a 6 hour TTL

### 3) Web output

- API: `GET /api/client/reports/weekly?week=YYYY-WNN`
  - Auth via `validateClientSession()`
  - Scope limited to current client project only
- UI page: `/client/reports/weekly`
  - Redirects unauthenticated users to `/client/login?redirect=/client/reports/weekly`
  - Includes:
    - Header (project, week range, client)
    - Completed cards with expandable "what was done", PR links, per-task videos
    - Progress bar (done / total for active milestones)
    - Blocked list with reasons
    - Up next (top queued todo tasks)
    - Timeline note text (fixed copy)

### 4) Email output

`lib/email.ts` adds:

- Template key: `weekly_summary`
- Renderer: `renderWeeklySummaryHtml(copy, vars)`
- Sender: `sendWeeklySummaryEmail(to, vars)`

Email preview and editing support is wired through:

- `app/api/admin/emails/route.ts`
- `app/api/admin/emails/preview/route.ts`
- `app/admin/emails/emails-client.tsx`

### 5) Weekly send trigger

`POST /api/admin/reports/send-weekly`

Authorization:

- Admin session (`isAdmin`)
- or cron header secret (`x-weekly-reports-secret` = `WEEKLY_REPORTS_SECRET`)

Behavior:

- Iterates `clients`
- Sends only when `emailPreferences.weeklySummary === true`
- Skips clients missing `email` or `milestoneProjectId`
- Returns summary with sent/skipped/failed counts and per-client detail

## Week parsing

Week values use ISO week format: `YYYY-WNN`.

- Default week resolves from current UTC date.
- Week range covers Monday 00:00:00 UTC through Friday 23:59:59 UTC.

## Timeline note contract

The timeline note is static and must remain:

`Task-based cadence. Up to 48hrs per task. Fluid based on priorities.`
