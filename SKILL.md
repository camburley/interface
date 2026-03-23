# Burley Board — Agent Skill

Manage tasks, milestones, and stories on the burley.ai SCRUM board via REST API.

## Base URL

```
https://www.burley.ai/api/admin
```

## Auth

Every request needs:
```
Authorization: Bearer burley-api-token-2026
X-Agent-Id: <your-agent-name>
Content-Type: application/json
```

## Board Types

Three boards, filtered by `boardType`:
- `client` — paid client projects
- `internal` — self-funded products (Bouncer, Polymarket, Supermarket Puzzle)
- `ops` — operations (Bob Ops, Content Pipeline, Agent Infra)

## Workflow

Tasks follow a strict state machine:
```
backlog → todo → in_progress → review → qa → done
                     ↘ blocked ↙
```

- `review` requires an artifact (PR or URL) attached first
- `qa` requires actor = `qa-agent`, `lead-agent`, or `admin`
- `blocked` accessible from backlog, todo, in_progress, review
- `done → todo` reopens a task

## Quick Reference

### List projects by board
```bash
GET /tasks/projects?boardType=internal
```

### List tasks
```bash
GET /tasks?projectId=bouncer-cash
GET /tasks?status=blocked
GET /tasks?assignee=bob
```

### Create a task
```bash
POST /tasks
{"title": "...", "projectId": "bouncer-cash", "priority": "high", "actor": "bob"}
```
Required: `title`, `projectId`

### Move a task
```bash
POST /tasks/:taskId/move
{"status": "todo", "actor": "bob"}
```
Must follow workflow transitions. Returns `400` on invalid transition.

### Block a task
```bash
POST /tasks/:taskId/block
{"reason": "Waiting on bank PDFs", "actor": "bob"}
```

### Add a comment
```bash
POST /tasks/:taskId/comment
{"actor": "bob", "content": "Started work, ETA 2h"}
```

### Attach an artifact
```bash
POST /tasks/:taskId/artifact
{"type": "github_pr", "url": "https://...", "label": "Feature PR"}
```
Types: `github_pr`, `url`, `file`, `screenshot`, `other`

### Claim a task
```bash
POST /tasks/:taskId/claim
{"actor": "bob", "confidence": 0.9}
```

### Complete a task
```bash
POST /tasks/:taskId/complete
{"evidence": "All tests passing", "confidence": 1.0}
```

### Split a task
```bash
POST /tasks/:taskId/split
{"subtasks": [{"title": "Part 1", "priority": "high"}, {"title": "Part 2"}]}
```

### Get task with history
```bash
GET /tasks/:taskId
```

### Update task fields
```bash
PATCH /tasks/:taskId
{"title": "...", "priority": "high", "tags": ["..."], "assignee": "bob"}
```

### Delete a task
```bash
DELETE /tasks/:taskId
```

## Milestones

```bash
GET    /milestones?projectId=bouncer-cash
POST   /milestones  {"projectId": "...", "title": "...", "status": "draft"}
GET    /milestones/:id
GET    /milestones/:id/stories
PATCH  /milestones/:id/stories/:storyId  {"status": "in-progress"}
```

Story statuses: `todo`, `in-progress`, `review`, `done`, `blocked`

## Moving Through Full Pipeline

```bash
# 1. backlog → todo
POST /tasks/TASK-001/move  {"status":"todo","actor":"bob"}

# 2. todo → in_progress
POST /tasks/TASK-001/move  {"status":"in_progress","actor":"bob"}

# 3. Attach artifact (REQUIRED before review)
POST /tasks/TASK-001/artifact  {"type":"url","url":"https://...","label":"Output"}

# 4. in_progress → review
POST /tasks/TASK-001/move  {"status":"review","actor":"bob"}

# 5. review → qa (needs admin/qa-agent role)
POST /tasks/TASK-001/move  {"status":"qa","actor":"admin"}

# 6. qa → done
POST /tasks/TASK-001/move  {"status":"done","actor":"admin"}
```

## Project IDs

### Internal (Products)
- `bouncer-cash` — Bouncer.cash
- `polymarket-bot` — Polymarket Arbitrage Bot
- `supermarket-puzzle` — Supermarket Puzzle / Grocery Intelligence Index

### Ops (Operations)
- `bob-ops` — Bob Operations
- `content-pipeline` — Content Pipeline
- `agent-infra` — Agent Infrastructure

### Client
- `prediction-quant` — Prediction Quant
- `dme-engine` — DME Engine
- `dolceright-mobile-app` — DolceRight Mobile App
- `fedex-dashboard` — FedEx Dashboard
- `grain-ledger` — Grain Ledger
