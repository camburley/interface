# Robbie Integration Architecture

## Overview

Robbie is an OpenClaw agent running on Cam's iMac. This document defines how to integrate Robbie into the Burley.ai agent org — covering context sharing, delegation, board access, channel setup, and the Bouncer test automation role.

---

## 1. Current Org Snapshot

### Agents (Mac Mini — this machine)
| Agent | Role | Board |
|-------|------|-------|
| Bob | Chief of Staff | bob-ops |
| Deebo | Cross-Board PM | deebo-pm |
| Kat | Marketing | kat-marketing |
| Sal | Sales | sal-sales |
| Jesse | Growth | jesse-growth |
| Numbers | Finance | numbers-finance |
| Teddy | TBD | — |
| Kevin | TBD | — |
| Brodie | Tech Support (shelved) | — |
| TPM | Technical PM (shelved) | — |

### Robbie (iMac — separate machine)
- **Hardware:** iMac with Cursor, browser access, full dev environment
- **Current state:** In #intraclaw channel, used for Bouncer testing
- **Capacity:** Idle most of the day — untapped compute + Claude Code subscription

---

## 2. Robbie's Role Definition

### Primary: Internal Tools Engineer
Robbie builds and maintains internal infrastructure. Not client work — internal compounding.

**Responsibilities:**
1. **Bouncer test automation** — automated test suites so Cam isn't the bottleneck
2. **Admin board improvements** — burley.ai/admin features, bug fixes, UI polish
3. **Agent infrastructure** — skills, shared utilities, cross-agent tooling
4. **Internal product dev** — Bouncer.cash, Supermarket Puzzle, content pipeline tools

**Does NOT do:**
- Client-facing work (Ali, Jan, Julianna)
- Operations (Bob's domain)
- External communications (Sal, Kat)
- Finance (Numbers)

### Board Assignment
- **Primary:** `agent-infra` (Agent Infrastructure)
- **Secondary:** `bouncer-cash` (Bouncer.cash)
- Tasks from these boards get assigned to Robbie
- Deebo tracks card health across all boards including Robbie's

---

## 3. Architecture — How Robbie Connects

### Option A: Standalone OpenClaw Instance (RECOMMENDED)
Robbie runs its own OpenClaw daemon on the iMac.

```
┌──────────────┐     ┌──────────────┐
│  MAC MINI    │     │    iMAC      │
│              │     │              │
│  Bob         │     │  Robbie      │
│  Deebo       │     │  (OpenClaw)  │
│  Kat, Sal... │     │  + Cursor    │
│              │     │  + Browser   │
│  OpenClaw ◄──┼─────┼── Slack ───► │
│  Gateway     │     │  OpenClaw    │
│              │     │  Gateway     │
└──────────────┘     └──────────────┘
        │                    │
        └────── Slack ───────┘
        └──── Board API ─────┘
        └── GitHub Repos ────┘
```

**Pros:**
- Independent throughput (own Claude Code sub)
- Can work in parallel with all Mac Mini agents
- Own workspace, memory, heartbeat cycle
- Survives Mac Mini downtime

**Cons:**
- Two OpenClaw instances to maintain
- Context sharing requires explicit sync (Slack, files, board API)

### Communication Channels
1. **Slack #intraclaw** — Robbie's home channel (already exists)
2. **Board API** — Robbie reads/writes tasks via `https://www.burley.ai/api/admin/`
3. **GitHub** — Robbie clones repos directly, pushes PRs
4. **Shared Slack channels** — Robbie can be added to #burley-ai, #daily-standup as needed

---

## 4. Setup Checklist

### Phase 1: OpenClaw on iMac
- [ ] Install OpenClaw on iMac (`npm i -g openclaw`)
- [ ] Configure `openclaw.json` with Slack bot token (Robbie's own bot, or shared workspace bot)
- [ ] Create workspace: `~/.openclaw/workspaces/robbie/`
- [ ] Write SOUL.md, AGENTS.md, USER.md (can copy templates from Bob)
- [ ] Set up HEARTBEAT.md with internal-focused sweep
- [ ] Configure #intraclaw as primary channel
- [ ] Add #daily-standup for standup posts

### Phase 2: Board Integration
- [ ] Give Robbie board API access (same bearer token, `X-Agent-Id: robbie`)
- [ ] Assign existing `agent-infra` + `bouncer-cash` tasks to `robbie`
- [ ] Deebo adds Robbie's boards to daily audit sweep

### Phase 3: Code Access
- [ ] Clone key repos on iMac:
  - `camburley/interface` (admin board)
  - `camburley/bouncer` (Bouncer.cash)
  - Any other internal repos
- [ ] Set up GitHub SSH keys on iMac
- [ ] Cursor configured with repos open

### Phase 4: Bouncer Test Automation
- [ ] Define Bouncer test suite (happy path, edge cases, regression)
- [ ] Robbie writes automated test scripts (Playwright or similar)
- [ ] Cron or heartbeat triggers test runs
- [ ] Results posted to #intraclaw
- [ ] Cam no longer manually drives test sessions

### Phase 5: Delegation Protocol
- [ ] Bob can delegate internal tasks to Robbie via Slack (#intraclaw)
- [ ] Robbie picks up `agent-infra` board tasks during heartbeats
- [ ] Robbie posts standup to #daily-standup daily
- [ ] Artifacts (PRs, docs, specs) linked to board cards

---

## 5. Context & Memory Architecture

### What Robbie Needs Access To
| Resource | How | Notes |
|----------|-----|-------|
| Board API | HTTPS | Same as all agents |
| Slack | Bot token | Own bot or shared |
| GitHub repos | SSH clone | On iMac locally |
| Shared specs | `interface/specs/` | Via git pull |
| Agent context | Read-only Slack history | #burley-ai, #intraclaw |

### What Robbie Does NOT Need
- Bob's memory files (personal, grocery, client context)
- Client Upwork threads
- Gmail access
- Grocery browser sessions
- Finance/tax data

### Memory Structure (iMac)
```
~/.openclaw/workspaces/robbie/
├── SOUL.md          # Internal tools engineer identity
├── AGENTS.md        # Standard operating procedures
├── USER.md          # Cam's preferences (subset)
├── TOOLS.md         # iMac-specific tool notes
├── HEARTBEAT.md     # Internal sweep checklist
├── MEMORY.md        # Long-term memory
└── memory/
    ├── YYYY-MM-DD.md        # Daily logs
    ├── heartbeat-state.json # Sweep state
    └── bouncer-test-log.md  # Test results
```

---

## 6. Bouncer Test Automation — Detailed Plan

### Why
Cam is currently the only person driving Bouncer tests. This makes him the bottleneck. Robbie automates this.

### Test Categories
1. **Smoke tests** — App loads, auth works, basic navigation
2. **Plaid flow** — Bank connection simulation (sandbox mode)
3. **Transaction categorization** — Known inputs → expected outputs
4. **UI regression** — Screenshot comparison after changes
5. **API health** — Endpoint response codes + timing

### Execution Model
```
Robbie heartbeat (every 30 min)
  └─ Check #intraclaw for test requests
  └─ Check bouncer-cash board for new tasks
  └─ If code pushed to bouncer repo:
       └─ Pull latest
       └─ Run test suite
       └─ Post results to #intraclaw
       └─ Update board card if test-related
```

### Tooling
- **Playwright** on iMac (browser automation)
- **Cursor** for writing/updating test scripts
- **GitHub Actions** as backup CI (but Robbie is faster for iterative testing)

---

## 7. Delegation Flow

```
┌─────────┐  "Build X"  ┌─────────┐
│   Cam   │────────────►│   Bob   │
└─────────┘             └────┬────┘
                             │
              Internal task? │
                             ▼
                      ┌──────────┐
                      │  Robbie  │
                      │  (iMac)  │
                      └────┬─────┘
                           │
                    Builds it, PRs it
                           │
                           ▼
                    ┌──────────────┐
                    │ #intraclaw   │
                    │ "Done, PR    │
                    │  #42 ready"  │
                    └──────┬───────┘
                           │
                    Deebo verifies card
                    Bob routes to Cam
```

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Two OpenClaw instances drift | Shared board API is source of truth |
| Robbie goes idle unnoticed | Heartbeat + standup in #daily-standup |
| Duplicate work | Clear board ownership (Deebo enforces) |
| Slack token issues | Robbie gets own Slack bot app |
| iMac offline | Tasks stay on board, Mac Mini agents can pick up |

---

## 9. Day 1 Priorities (After Setup)

1. **TASK-169** — Research OpenClaw + Claude Code skills (already on agent-infra board)
2. **Bouncer smoke test suite** — Get basic automated tests running
3. **Board bug fixes** — `/admin/board` has known issues, Robbie can tackle

---

## 10. Decision Points for Cam

1. **Slack bot:** Does Robbie get its own Slack bot app, or share the existing one?
2. **Channel access:** Which channels beyond #intraclaw? (#burley-ai? #daily-standup?)
3. **GitHub permissions:** Does the iMac already have SSH keys set up for camburley repos?
4. **Cursor subscription:** Confirm Robbie can use the iMac's Claude Code/Cursor sub for autonomous coding
5. **Board scope:** Should Robbie also own `supermarket-puzzle` tasks, or keep that with Kat?

---

*Generated by Bob · TASK-370 · 2026-03-28*
