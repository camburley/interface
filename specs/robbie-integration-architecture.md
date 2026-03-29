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
- **Current state:** In #intraclaw channel, Slack live, board API confirmed, GitHub SSH live
- **Dual identity:**
  - **Bouncer persona:** Caviar brand strategist — used as the brand agent in Bouncer negotiations (simulation counterparty)
  - **Operational role:** Internal tools engineer — board tasks, code, eval harness
- **Capacity:** Idle most of the day — untapped compute + Claude Code subscription

---

## 2. Robbie's Role Definition

### Dual Role
Robbie serves two functions simultaneously:

**① Bouncer Simulation Agent (Caviar Brand Strategist)**
- Robbie's SOUL.md identity is "Caviar brand strategist" — culturally sharp, direct comms, premium sensibility
- This persona is used as the brand counterparty in Bouncer negotiation simulations
- Cam runs these simulations to benchmark and improve negotiation quality
- This is Robbie's primary differentiated function — not replicable by any other agent

**② Internal Tools Engineer (Operations)**
Robbie builds and maintains internal infrastructure. Not client work — internal compounding.

**Responsibilities:**
1. **Bouncer test automation** — automated test suites so Cam isn't the bottleneck
2. **Eval harness** — TrajectoryRecorder, TrajectoryScorer, Eval Runner
3. **Admin board improvements** — burley.ai/admin features, bug fixes, UI polish
4. **Agent infrastructure** — skills, shared utilities, cross-agent tooling
5. **Internal product dev** — Bouncer.cash, Supermarket Puzzle, content pipeline tools

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

### Standalone OpenClaw Instance
Robbie runs his own OpenClaw daemon on the iMac.

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

### Communication Channels
1. **Slack #intraclaw** — Robbie's home channel
2. **Board API** — reads/writes tasks via `https://www.burley.ai/api/admin/` (X-Agent-Id: robbie)
3. **GitHub** — clones repos directly, pushes PRs as `camburley`
4. **Shared Slack channels** — can be added to #burley-ai, #daily-standup as needed

---

## 4. Setup Checklist

### ✅ Already Complete
- [x] OpenClaw on iMac running
- [x] Robbie in #intraclaw Slack channel
- [x] Board API access confirmed (burley-api-token-2026, X-Agent-Id: robbie)
- [x] GitHub SSH live (authenticated as camburley)
- [x] Slack app reinstalled with chat:write scope

### Phase 2: Board Integration — COMPLETE
- [x] Robbie has board API access
- [x] First task assigned: Eval Harness (e9Ee3fGA359XqW3A8qsM)

### Phase 3: Code Access — COMPLETE
- [x] GitHub SSH authenticated as camburley
- [ ] Clone key repos on iMac (if not already):
  - `camburley/interface` (admin board)
  - `camburley/bouncer` (Bouncer.cash)

### Phase 4: Bouncer Test Automation
- [ ] Define Bouncer test suite (happy path, edge cases, regression)
- [ ] Robbie writes automated test scripts (Playwright or similar)
- [ ] Cron or heartbeat triggers test runs
- [ ] Results posted to #intraclaw
- [ ] Cam no longer manually drives test sessions

### Phase 5: Delegation Protocol
- [ ] Bob delegates internal tasks to Robbie via Slack #intraclaw
- [ ] Robbie picks up `agent-infra` board tasks during heartbeats
- [ ] Robbie posts standup to #daily-standup daily
- [ ] Artifacts (PRs, docs, specs) linked to board cards

---

## 5. Context & Memory Architecture

### What Robbie Needs Access To
| Resource | How | Notes |
|----------|-----|-------|
| Board API | HTTPS | Same bearer token, X-Agent-Id: robbie |
| Slack | Bot token | Own app (A0ANX6P08CS) |
| GitHub repos | SSH clone | On iMac locally |
| Shared specs | `interface/specs/` | Via git pull |

### What Robbie Does NOT Need
- Bob's memory files (personal, grocery, client context)
- Client Upwork threads
- Gmail access
- Grocery browser sessions
- Finance/tax data

### Memory Structure (iMac)
```
~/.openclaw/workspaces/robbie/
├── SOUL.md          # Caviar brand strategist identity
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

## 6. Bouncer Quality Benchmarking

### Context
Bouncer negotiations are now at a functional level — socket opens, offers flow, agents converse. The focus has shifted to **negotiation quality**.

### Quality Dimensions to Benchmark
1. **Offer validity** — are proposed terms coherent and internally consistent?
2. **Counter-move quality** — does the counterparty respond appropriately to offers?
3. **Value distribution** — are negotiated outcomes reasonable for both parties?
4. **Convergence speed** — how many turns to reach agreement or impasse?
5. **Robustness** — does behavior vary appropriately with different opening positions?

### Robbie's Role in Benchmarking
- Owns the eval harness (TrajectoryRecorder + Scorer + Runner)
- Runs structured benchmarks with logged trajectories
- Scores sessions against quality dimensions
- Posts results to #intraclaw for Cam review

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
                    Builds it,
                    posts link to
                    board card
```

**Bob → Robbie delegation rules:**
- Tag <@U0AP0RPRR52> in #intraclaw for all Robbie tasks
- Always include: board card link, success criteria, deadline
- Robbie tags Bob back when done
