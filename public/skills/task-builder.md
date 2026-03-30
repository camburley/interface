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
| **Outcome** | What exists when this task is done, in 1-2 sentences |
| **Category** | `feature` · `integration` · `design` · `infrastructure` · `fix` · `automation` · `api` · `internal-tool` · `refactor` |
| **Size** | S, M, or L (see below) |
| **Acceptance criteria** | How we verify this task is complete |
| **Dependencies** | Which tasks must finish first (by number) |

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
- You can't describe the acceptance criteria in 1-2 sentences

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
**Outcome:** [What exists when done]
**Acceptance:** [How we know it's done]
**Depends on:** none

### 02 · [Title] — [S/M/L]
**Category:** infrastructure
**Outcome:** [What exists when done]
**Acceptance:** [How we know it's done]
**Depends on:** 01

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

## Examples

### Input: "Build me a client portal"

**Clarifying questions asked:** Who are the clients? What do they see? Auth needed? Integrations?

**After answers:** B2B SaaS clients. They log in, see project status, upload files, view invoices. Stripe for billing. Existing Next.js app.

**Breakdown:**

```
01 · Define MVP scope and data model — M
    Category: infrastructure
    Outcome: ERD and page list documented, data model created
    Acceptance: Schema exists, team agrees on MVP feature set
    Depends on: none

02 · Create auth flow — M
    Category: feature
    Outcome: Login, register, password reset working
    Acceptance: User can register, log in, reset password, session persists
    Depends on: 01

03 · Build dashboard shell and navigation — M
    Category: feature
    Outcome: Authenticated layout with sidebar nav, empty state pages
    Acceptance: Logged-in user sees dashboard frame, can navigate sections
    Depends on: 02

04 · Implement account settings — S
    Category: feature
    Outcome: User can update profile, change password
    Acceptance: Settings page saves changes, validation works
    Depends on: 02

05 · Build project status view — L
    Category: feature
    Outcome: Client sees list of projects with status, can drill into details
    Acceptance: Projects load from DB, status badges display, detail page works
    Depends on: 03

06 · Add file upload — M
    Category: feature
    Outcome: Client can upload files to a project, see upload history
    Acceptance: Upload works, files stored, download link works
    Depends on: 05

07 · Connect invoicing / billing — L
    Category: integration
    Outcome: Client sees invoices pulled from Stripe, payment status
    Acceptance: Stripe invoices display, status is accurate, links to Stripe portal
    Depends on: 03

08 · QA pass and release checklist — S
    Category: fix
    Outcome: All flows tested, edge cases handled, ready for production
    Acceptance: Auth, uploads, billing, navigation all pass manual QA
    Depends on: 04, 05, 06, 07

Parallel tracks:
  Track A: 01 → 02 → 03 → 05 → 06 → 08
  Track B (after 03): 04, 07 can run alongside Track A
  Convergence: 08 requires all tracks complete
```

---

### Input: "Make our app faster"

**Response before breakdown:**

> Before I break this down, I want to flag something. "Make it faster" isn't a concrete deliverable — it's a goal. I need to ask a few questions to turn this into sized tasks:
>
> 1. What feels slow right now? Specific pages, actions, or load times?
> 2. Do you have any performance data — Lighthouse scores, Core Web Vitals, user complaints?
> 3. What's the tech stack?
> 4. What would "fast enough" look like? A number? A feeling?

This is the correct behavior. Do not fabricate tasks for vague requests.

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

---

## Integration With Other Skills

- After sizing, use **create-loom-script** to demo completed tasks
- After sizing, use **pre-delivery-product-qa** to verify each task matches the original request
- After sizing, use **package-client-offer** if the client needs to be onboarded to a lane
- After sizing, use **upwork-client-response** if delivering the breakdown as a message
