# Client Board Agent

## Purpose

The client board agent gives logged-in clients a direct chat interface on `/client/board` so they can ask questions about current task state without email back-and-forth.

## Components

### API route

- Path: `POST /api/client/agent/chat`
- File: `app/api/client/agent/chat/route.ts`

#### Request payload

```json
{
  "message": "string",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

#### Auth and access control

- Uses `getSessionUser()` from `lib/session.ts`.
- Looks up the signed-in user in `clients/{uid}`.
- Requires `clients/{uid}.milestoneProjectId`.
- Returns:
  - `403` when no valid session or no client doc
  - `400` when no linked project or invalid input

#### Configuration guard

- Requires `ANTHROPIC_API_KEY`.
- If missing, returns `503` with:

```json
{ "error": "Agent not configured" }
```

#### Rate limiting

- In-memory limiter keyed by `uid`.
- 20 requests per 60 seconds.
- Exceeding limit returns `429`.

#### Runtime context assembly

For each request, the route builds board context from Firestore:

1. `clients/{uid}` for `milestoneProjectId`
2. `milestone_projects/{projectId}` for project name
3. `tasks` filtered by `.where("projectId", "==", projectId)`

Task context includes:

- `taskId`
- `title`
- `status`
- `description` (prefers `clientDescription`, falls back to `description`)
- `acceptanceCriteria`
- `completedAt`
- `dependencies`

Project metadata includes:

- Project name
- Timeline note: `Task-based cadence. Up to 48hrs per task. Fluid based on priorities.`

#### System prompt contract

The prompt enforces:

- task explanations and dependency reasoning
- what-if answers grounded in current board state
- strict refusals for launch/timeline promises and business strategy decisions

The exact required redirect responses are hard-coded and also included in the prompt:

- Timeline question redirect
- Business strategy redirect

#### Streaming behavior

- Uses `@anthropic-ai/sdk` with model `claude-sonnet-4-20250514`
- `max_tokens: 8192`
- Returns SSE (`text/event-stream`)
- Stream events:
  - `{"type":"chunk","content":"..."}`
  - `{"type":"done"}`
  - `{"type":"error","error":"..."}`

## UI widget

- File: `components/board-agent/board-agent-chat.tsx`
- Mounted on client board page from `app/client/board/page.tsx`

### UX behavior

- Floating chat button in bottom-right
- Right-side slide-out panel
  - Desktop: `400px`
  - Mobile: full width
- Messages:
  - user right aligned
  - assistant left aligned
- Input supports Enter to send
- Assistant response streams in real time as SSE chunks arrive

### State and persistence

- Session persistence uses `sessionStorage`
- Keyed by project: `burley_board_agent_chat_${projectId}`
- Includes:
  - hydration loading state
  - typing indicator while streaming
  - rate-limit error state

### Theme alignment

Uses existing design tokens and UI primitives:

- colors from CSS variables (`--background`, `--card`, `--foreground`, `--muted-foreground`, `--accent`, `--border`)
- IBM Plex Mono typography from global theme
- shared components: `Button`, `Input`, `ScrollArea`, `Spinner`
