---
name: product-sizing-task-builder
description: Break down a client's project into standard-sized queue tasks for async lane-based delivery. Use when a user describes a new project, brings an idea to scope, asks to size work, or needs a project broken into deliverables. Asks clarifying questions first, then produces a sequenced task breakdown.
---

# Product Sizing / Task Builder

Take a project description and break it into standard-sized tasks that move through a queue.

## When to Use

- User describes a project or idea they want built
- User says "size this", "break this down", "scope this", "task this out"
- User pastes a client request and needs it decomposed
- Before kicking off any new body of work

## Core Concept

This is **not** project management. There are no SOWs, no sprint plans, no Gantt charts, no timeline estimates.

Work moves through a **queue**. Each item in the queue is a **standard-sized task** — one clear outcome that fits within a single operating window. The subscription lane determines how many tasks are active at once:

| Lane | Active Tasks | Monthly |
|------|-------------|---------|
| Core | 1 at a time | $4,995 |
| Priority | 2 at a time | $7,995 |
| Continuity | Lower throughput | $1,995 |

Your job is to take whatever the user describes and turn it into a **sequenced list of queue-ready tasks**. That's it. You are decomposing work, not estimating timelines.

**Do NOT calculate days, hours, weeks, or any time-to-completion estimates.** The output is a task list with sequencing and relative size. Time estimation is noise — it leads to wrong expectations, false precision, and bad commitments. The queue moves at the pace it moves.

---

## Step 1: Clarifying Questions

**Before breaking anything down, ask these questions.** Do not skip this step. Bad input produces bad task breakdowns.

Ask all that apply. Group them in a single message.

### Always Ask

1. **What is this?** — "Describe what you want built in 2-3 sentences. What does the end user do with it?"
2. **Who uses it?** — "Who is the primary user? Internal team, customers, admins, public visitors?"
3. **Does anything exist already?** — "Is this greenfield or are we adding to / modifying an existing system? If existing, what's the tech stack?"
4. **What does 'done' look like?** — "If this were finished and in front of you, what would you see? What would you be able to do?"

### Ask If Relevant

5. **Auth required?** — "Do users need to log in? Are there roles or permissions?"
6. **Third-party integrations?** — "Does this connect to any external services — payment, email, CRM, API, database?"
7. **Data model clarity** — "What are the core objects? (e.g., users, orders, reports, listings)"
8. **Design expectations** — "Do you have wireframes, Figma, a reference site, or are you expecting design to be figured out?"
9. **Constraints or deadlines** — "Is there a hard launch date or dependency that affects sequencing?"
10. **What's the first thing that matters most?** — "If you could only ship one piece of this first, what would it be?"

### Red Flags to Surface

If any of these are true, name them immediately:

- The description sounds like a whole company, not a feature
- There are no concrete deliverables, only abstract goals ("make it better", "AI-powered")
- The user can't describe what 'done' looks like
- Multiple unrelated systems with unclear dependencies
- Heavy compliance, procurement, or enterprise process requirements

**Say:** "Before I break this down, I want to flag [concern]. This may need [clarification / a phased approach / more definition] before tasks can be sized."

---

## Step 2: Break Down Into Tasks

Once you have enough context, decompose the project into tasks.

### What Makes a Valid Task

A task is queue-ready when it has ALL of these:

| Field | Description |
|-------|-------------|
| **Title** | Short, specific. "Create auth flow" not "Handle users" |
| **Description** | Technical implementation spec for the person building it (see Technical Description Rules below) |
| **Outcome** | What exists when this task is done, in 1-2 sentences |
| **Category** | `feature` · `integration` · `design` · `infrastructure` · `fix` · `automation` · `api` · `internal-tool` · `refactor` |
| **Size** | S, M, or L (see below) |
| **Acceptance criteria** | 4-8 specific, independently testable conditions (see Acceptance Criteria Rules below) |
| **Definition of done** | 3-5 concrete verification steps — devices tested, edge cases exercised, scenarios covered (see Definition of Done Rules below) |
| **Dependencies** | Which tasks must finish first (by number) |
| **Client description** | Plain-English explanation for a non-technical business owner with ASCII art (see Client Description Rules below) |

**Every field is required. No exceptions. No empty fields. No single-sentence placeholders.**

---

### Technical Description Rules

The `description` is a mini implementation spec. It is written for the developer who will build it. It should be detailed enough that a senior dev who has never seen the codebase could build the feature without asking questions.

**Include all that apply:**

- **Data model**: exact collections/tables, fields, types, relationships, indexes
- **Files**: which files to create, which to modify (by path if known)
- **Sub-screens / steps**: if the feature has multiple views, list each one with its inputs, layout, and behavior
- **Conditional logic**: what triggers what, skip conditions, edge cases, feature flags
- **UI specifics**: measurements (px), colors (hex), breakpoints, layout rules (grid vs flex), responsive behavior
- **Animation / interaction**: durations (ms), easing, transitions, reduced-motion behavior
- **API surface**: endpoint paths, request/response shapes, error codes, auth requirements
- **State management**: what gets stored where, persistence strategy, cache behavior
- **Validation rules**: required fields, formats, constraints, error messages, real-time vs submit-time
- **Triggered side effects**: what other parts of the system update when this task completes (e.g., document fill states, progress meters, notification triggers)

**Bad description (too vague):**
"Build the auth flow. Users log in with Google, Apple, or email. Session persists."

**Good description:**
```
Firebase Auth integration with three sign-in methods in priority order:
  1. Continue with Google (one-tap on mobile)
  2. Continue with Apple (required for iOS)
  3. Email + password (fallback)

Sign-in UI: social buttons displayed above email/password fields
with a divider line between them.

Account creation: embedded in the onboarding flow's final step —
not a separate registration page. User completes free assessment,
sees results, then signs up inline.

Session: Firebase Auth session persists via auth state listener.
On app load, check currentUser. If authenticated, fetch user doc
from Firestore and hydrate state. If not, show the free flow
(no auth required for the initial assessment).

Auth gates: paid features require auth. If unauthenticated user
tries to access a gated screen, redirect to sign-up prompt.

Key files:
  New: app/login/page.tsx — returning user login
  Modify: components/screens/results.tsx — embed sign-in form
  New: lib/auth.ts — Firebase Auth helpers, state listener
  New: components/auth-form.tsx — reusable Google/Apple/email component
```

---

### Acceptance Criteria Rules

Acceptance criteria are **specific, independently testable conditions**. Each one is a sentence you could hand to a QA person who would know exactly what to check. Not "it works" — each criterion isolates one verifiable behavior.

**Minimum 4 criteria per task. Aim for 5-8.**

**Bad (too vague, too few):**
"Auth works, session persists"

**Good:**
- Google sign-in works on desktop and mobile (one-tap)
- Apple sign-in works on Safari/iOS
- Email/password registration and login work
- Session persists across browser restarts
- Unauthenticated users blocked from paid features with redirect to sign-up
- Sign-in form embedded inline in the onboarding flow — not a separate page

Each criterion should pass or fail independently. If you can't test it without testing something else, it's not a criterion — it's part of a larger one. Split it.

---

### Definition of Done Rules

Definition of done is **how we verify the task is shippable** — not what makes it correct (that's acceptance criteria), but what scenarios and environments we've confirmed it in.

**Minimum 3 items per task. Aim for 4-5.**

Include:
- **Devices / browsers tested**: "Mobile tested on iPhone SE and Pixel 7"
- **Edge cases exercised**: "Tested with 0, 1, and 10 items in the list"
- **Specific scenarios verified**: "Duplicate detection tested with matching and non-matching names"
- **Performance thresholds**: "Page loads in <2s on 3G" (if applicable)
- **Regression checks**: "Existing screens still work with new step numbering"

**Bad:**
"Tested and working"

**Good:**
- All three auth methods tested on Chrome, Safari, Firefox
- Mobile tested on iOS Safari and Android Chrome
- Auth state listener hydrates user data on app load
- Paid feature gate redirects correctly for unauthenticated users

---

### Client Description Rules

Every task MUST include a `clientDescription` — a plain-English explanation written for the business owner who is paying for this work. This is what appears on their board by default (they can toggle to see the technical description if they want).

Rules:
- 3-6 short sentences max
- NO jargon: no "API", "endpoint", "schema", "Firestore", "adapter", "pipeline", "webhook", "middleware"
- Explain WHAT it does for the user, not HOW it works under the hood
- Use "you/your" to address the end user directly
- Start with a one-line summary of what this gives them
- **ALWAYS include an ASCII art diagram if the feature has any visible UI or user-facing flow.** This is not optional. Most tasks have a UI component — draw it.
- ASCII art: max 12 lines, max 40 chars wide, using `+`, `-`, `|`, and plain text
- Think: "How would I explain this to the person writing the check?"

**Bad (jargon, no diagram):**
"Build secure third-party API key input flow. Users paste their API key + secret → encrypted at rest in Firestore under user doc. Add a /settings panel for connect/disconnect. Validate keys against GET /account/balance before saving."

**Good (plain English, with diagram):**
```
Connect your trading account so the system can see
your live positions.

  +-----------------------------------+
  | Settings                          |
  |                                   |
  | Trading Account API Key           |
  | [________________________] [Save] |
  |                                   |
  | Status: Connected (green dot)     |
  | Last synced: 2 minutes ago        |
  +-----------------------------------+

You paste your key in Settings, we store it securely,
and the system pulls your trades automatically.
You can disconnect anytime with one click.
```

---

### Size Definitions

Size is **relative complexity**, not a time estimate. Do not convert sizes to hours or days.

| Size | Meaning | Examples |
|------|---------|---------|
| **S** | One focused, contained change. Minimal unknowns. | Bug fix, copy change, config update, small UI tweak, adding a field, a QA/polish pass. |
| **M** | One coherent feature or deliverable. Clear scope, self-contained. | A page, a component, an integration, an API endpoint, a data model, a hook/service layer. |
| **L** | Multiple moving parts, but still one deliverable. Involves coordination across layers. | A feature spanning frontend + backend + data. A multi-step flow. A complex integration. If it feels bigger than L, it must be split further. |

**Nothing is bigger than L.** If a task feels like it's beyond L, it's not a task — it's multiple tasks bundled together. Split it.

### What's Too Large (Must Be Split)

A task is too large if:

- It contains **multiple unrelated outcomes**
- It would normally require a **full spec** before execution
- It spans **multiple systems** with unclear dependencies
- It sounds like a **whole project** instead of a deliverable
- You can't describe the acceptance criteria in 4+ sentences

**When a task is too large, do not reject it. Break it down.**

### Sequencing Rules

- Order by **logical dependency** — earlier tasks unblock later ones
- Group related tasks so the user sees **incremental value** at each step
- The first 1-3 tasks should produce something **visible and testable**
- Infrastructure and data model work comes before features that depend on it
- Frontend and backend can often be sequenced in parallel tracks if scoped correctly
- Note which tasks are **parallelizable** (no shared dependencies) — this is useful for Priority lane subscribers, but do not calculate timelines from it

---

## Step 3: Output the Breakdown

Present the full task list in this format:

```
## Project Breakdown: [Project Name]

**Summary:** [One sentence describing the overall decomposition]

**Total tasks:** X (Y small, Z medium, W large)

---

### 01 · [Title] — [S/M/L]
**Category:** feature
**Description:**
[Multi-paragraph technical implementation spec]

**Outcome:** [What exists when done — 1-2 sentences]

**Acceptance criteria:**
- [Specific testable condition 1]
- [Specific testable condition 2]
- [Specific testable condition 3]
- [Specific testable condition 4]
- [Specific testable condition 5+]

**Definition of done:**
- [Verification step 1]
- [Verification step 2]
- [Verification step 3]

**Depends on:** none

**Client description:**
[Plain-English explanation with ASCII art diagram]

---

### 02 · [Title] — [S/M/L]
...
```

After the task list, include:

### Parallel Tracks

Identify which tasks can run simultaneously for subscribers with multiple active slots:

```
Track A (backend): 01 → 02 → 04 → ...
Track B (frontend): 05 → 06 → 07 → ...
Independent: 03 (no dependencies on either track)
```

This helps Priority lane subscribers understand throughput. **Do not convert this to a timeline.**

### Warnings

List anything that needs attention:

- Ambiguous requirements that may cause a task to stall
- External dependencies (APIs, third-party access, design assets)
- Scope creep risks — areas where "one more thing" is likely
- Tasks that might split further once work begins
- Convergence points where both tracks must complete before the next task can start

---

## Gold Standard Example

This is what a SINGLE well-written task looks like at full quality. Every task you produce must match this level of detail.

### 07 · Real-Time Data Freshness System — M
**Category:** feature
**Description:**
Live data updates for all active items with different refresh cadences per timeframe:
  Fast: every 5-10s (stale > 30s, aging > 20s)
  Medium: every 20-30s (stale > 60s, aging > 45s)
  Slow: every 30-60s (stale > 120s, aging > 90s)

Data freshness output per item: { lastUpdated, isStale, staleReason }.
When stale: suppress actionable signals, degrade recommendation to "watch", UI shows staleness indicator.
Hard rule for fast items: if data age > 30s AND phase = late, force recommendation = no_action immediately.

"watch" is ONLY used for stale data. Never as a live signal state.

Topbar freshness indicator: three states with color coding:
  fresh: green dot + "Data fresh — Xs ago"
  aging: amber dot + "Data aging — Xs ago"
  stale: red dot + "Data stale — Xs ago"

Scan countdown timer in topbar + table footer. "Refresh Now" button forces immediate fetch.

Desktop layout: indicator in topbar right-aligned, 200px wide.
Mobile layout: indicator below topbar as full-width strip, 32px tall.

Key files:
  New: lib/data-freshness.ts — freshness calculation + stale detection
  New: components/freshness-indicator.tsx — topbar indicator component
  Modify: lib/data-store.ts — add refresh loop with cadence tiers
  Modify: components/topbar.tsx — embed freshness indicator + countdown

**Outcome:** Users always know whether they are looking at live data, and the system automatically suppresses recommendations when data is stale.

**Acceptance criteria:**
- Three refresh cadences run at correct intervals
- Freshness indicator transitions through fresh → aging → stale states
- Stale data suppresses actionable signals automatically
- "Refresh Now" button forces immediate fetch and resets indicator
- Countdown timer shows seconds until next scan
- Hard rule fires for fast items when data age > 30s in late phase
- Indicator renders correctly in topbar (desktop) and strip (mobile)

**Definition of done:**
- Simulated stale data tested at 25s, 35s, 60s, 120s thresholds
- Refresh Now button tested during each freshness state
- Mobile strip tested on iPhone SE and Pixel 7
- No performance degradation from refresh loops (CPU < 5% idle)
- Stale suppression verified: no actionable signals shown when stale

**Depends on:** 03

**Client description:**
Data updates automatically so you always see live info.

Different items refresh at different speeds — fast-moving
ones update every few seconds, slower ones less often.

If data gets stale, the system tells you immediately:

  +--------------------------------------+
  | [*] Data fresh - 3s ago      (green) |
  | [!] Data aging - 25s ago     (amber) |
  | [X] Data stale - 45s ago     (red)   |
  +--------------------------------------+

When data is stale, the system suppresses recommendations
so you never act on outdated information. A countdown
shows when the next refresh happens, and you can force
a refresh anytime.

---

## Abbreviated Example (Full Project)

### Input: "Build me a client portal"

**Clarifying questions asked:** Who are the clients? What do they see? Auth needed? Integrations?

**After answers:** B2B SaaS clients. They log in, see project status, upload files, view invoices. Stripe for billing. Existing Next.js app.

**Breakdown:**

```
01 · Define MVP scope and data model — M
    Category: infrastructure
    Description:
      Firestore collections:
        clients/{uid}: company name, email, plan tier, created date
        clients/{uid}/projects/{pid}: name, status (active|paused|completed),
          created date, description
        clients/{uid}/files/{fid}: filename, storageUrl, uploadedAt, projectId
      Indexes: clients by plan tier, projects by status, files by projectId + uploadedAt

      Key files:
        New: lib/types/client.ts — TypeScript interfaces for all collections
        New: lib/firebase-client.ts — Firestore helpers (CRUD for each collection)
        New: docs/MVP_SCOPE.md — page list and feature matrix

    Outcome: Data model created, schema documented, MVP feature set agreed.

    Acceptance criteria:
      - All Firestore collections created with correct field types
      - TypeScript interfaces match Firestore schema exactly
      - MVP_SCOPE.md lists all pages and which features each includes
      - Indexes deployed and queryable
      - Schema supports file uploads linked to projects

    Definition of done:
      - Test data seeded for 3 clients, 5 projects, 10 files
      - All CRUD helpers tested with real Firestore reads/writes
      - MVP_SCOPE.md reviewed and agreed upon

    Depends on: none

    Client description:
      Map out exactly what your portal includes and how
      the data is organized.

        +-----------------------------------+
        |  CLIENT PORTAL — MVP              |
        |                                   |
        |  Pages:                           |
        |  [x] Dashboard                    |
        |  [x] Projects                     |
        |  [x] File uploads                 |
        |  [x] Invoices                     |
        |  [x] Settings                     |
        +-----------------------------------+

      This is the blueprint everything else is built on.
      No code gets written until the data structure is
      solid.

02 · Create auth flow — M
    Category: feature
    Description:
      Firebase Auth with two sign-in methods:
        1. Email + password (primary)
        2. Google sign-in (convenience)

      Sign-in page: /login route. Social button above email/password
      form with "or" divider.

      Registration: /register route. Fields: company name, full name,
      email, password. On submit: create Firebase Auth user, then create
      Firestore client doc with uid.

      Password reset: /forgot-password route. Sends Firebase Auth reset
      email.

      Session: auth state listener on app load. If authenticated, fetch
      client doc, hydrate context. If not, redirect to /login.

      Auth guard: middleware or layout-level check. All routes except
      /login, /register, /forgot-password require auth.

      Key files:
        New: app/login/page.tsx
        New: app/register/page.tsx
        New: app/forgot-password/page.tsx
        New: lib/auth.ts — Firebase Auth helpers + state listener
        New: components/auth-guard.tsx — layout-level redirect

    Outcome: Users can register, log in, reset password, session persists.

    Acceptance criteria:
      - Email/password registration creates user + Firestore doc
      - Google sign-in works and creates Firestore doc if first login
      - Password reset email sends and link works
      - Session persists across browser restarts
      - Unauthenticated access redirects to /login
      - Auth guard protects all authenticated routes

    Definition of done:
      - Tested on Chrome, Safari, Firefox
      - Mobile tested on iOS Safari
      - Registration with duplicate email shows clear error
      - Password reset tested with valid and expired links

    Depends on: 01

    Client description:
      Your clients can create accounts and log in securely.

        +-----------------------------------+
        | [G] Continue with Google          |
        |  ─────── or ───────              |
        |  Email [____________]            |
        |  Password [_________]            |
        |  [Log in]                        |
        |                                  |
        |  Forgot password? | Register     |
        +-----------------------------------+

      Google sign-in is one-tap — no passwords to remember.
      Password reset sends an email link automatically.
      Once signed in, they stay signed in across visits.

03 · Build dashboard shell and navigation — M
    Category: feature
    Description:
      Authenticated layout with sidebar navigation. All portal pages
      render inside this shell.

      Sidebar (desktop): 240px fixed left sidebar. Navigation items:
        Dashboard (home icon), Projects (folder), Files (upload),
        Invoices (receipt), Settings (gear)
      Active item: primary color highlight + bold text.
      Collapsed state: icon-only, 64px wide. Toggle button at bottom.

      Mobile: hamburger menu → Sheet drawer from left.
      Drawer contains same nav items. Closes on item click or outside tap.

      Dashboard home: summary cards row —
        Active projects count, Files uploaded count, Next invoice date,
        Subscription status badge
      Empty states: each card shows "No data yet" with subtle illustration.

      Key files:
        New: components/sidebar.tsx — desktop sidebar with collapse
        New: components/mobile-nav.tsx — hamburger + Sheet drawer
        New: app/dashboard/page.tsx — summary cards
        New: app/dashboard/layout.tsx — shell layout wrapping all pages

    Outcome: Logged-in user sees dashboard frame with sidebar nav.

    Acceptance criteria:
      - Sidebar shows all 5 nav items with correct icons
      - Active item highlighted on current route
      - Collapse toggle works (240px → 64px)
      - Mobile hamburger visible below md breakpoint
      - Sheet drawer opens/closes correctly on mobile
      - Dashboard summary cards render with correct counts
      - Empty states display when no data exists

    Definition of done:
      - Desktop tested at 1024px and 1440px widths
      - Mobile hamburger tested on iPhone SE (375px)
      - Sidebar collapse state persists across page navigation
      - All 5 nav links route to correct pages

    Depends on: 02

    Client description:
      The main layout your clients see after logging in.

        +------+----------------------------+
        | [D]  |  Dashboard                 |
        | [P]  |                            |
        | [F]  |  +------+ +------+ +----+  |
        | [I]  |  |Active| |Files | |Next|  |
        | [S]  |  |proj: | |  12  | |inv |  |
        |      |  |  3   | |      | |2/15|  |
        |      |  +------+ +------+ +----+  |
        +------+----------------------------+

      A sidebar menu on desktop, a hamburger menu on phone.
      The dashboard home shows a quick summary of their
      projects, files, and billing at a glance.
```

---

## What Does NOT Fit This Model

Name these explicitly if they come up:

- **Giant single-scope projects submitted as one task** — break them down
- **Unclear research-heavy initiatives with no deliverable** — ask for clarity first
- **Work requiring frequent live meetings** — this model is async by default
- **Deep enterprise procurement/compliance** — flag as a constraint
- **Work outside normal software/product implementation** — out of scope

---

## Anti-Patterns

- ❌ **Estimating timelines.** No days, hours, weeks, business days, or delivery dates. Ever. The queue moves at the pace it moves. Time estimation is noise that leads to wrong expectations.
- ❌ Breaking down without asking clarifying questions first
- ❌ Creating vague tasks like "Set up backend" or "Design frontend"
- ❌ Making every task size L to inflate perceived scope
- ❌ Including project management overhead as tasks (standups, status reports, planning)
- ❌ Producing fewer than 3 tasks for any non-trivial project
- ❌ Producing more than 15 tasks without grouping into phases
- ❌ Accepting "build me an app" as enough information to start
- ❌ Converting S/M/L into hours or days — size is relative complexity, not a time commitment
- ❌ Writing client descriptions with technical jargon — the client description is for the person paying, not the person building
- ❌ Skipping client descriptions — every task needs one, no exceptions
- ❌ **Skipping ASCII art in client descriptions** — if the feature touches UI or has a user-visible flow, draw it. Most features do. Default to including a diagram.
- ❌ **One-liner acceptance criteria** — "it works" is not a criterion. Each task needs 4-8 specific, testable conditions.
- ❌ **Empty definition of done** — every task must specify how it was verified: which devices, which edge cases, which scenarios.
- ❌ **Vague technical descriptions** — "build the auth flow" is not a description. Include data model, file paths, conditional logic, UI specs, validation rules.
