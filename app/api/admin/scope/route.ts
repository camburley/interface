import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { generateTaskId, buildNewTask, appendHistory } from "@/lib/task-utils"

const SYSTEM_PROMPT = `You are a senior software project planner for Burley, an async software delivery service. Your job is to take a client's project description and break it into standard-sized queue tasks.

RULES FOR TASK SIZING:
- A task should have ONE clear outcome and be reasonably scoped
- Each task must have a clear title, description, category, size, and acceptance criteria
- If the input describes a large initiative, break it into sequential deliverables
- Do NOT estimate hours, days, or timelines. Size is relative complexity, not a time commitment.

SIZE DEFINITIONS (relative complexity, NOT time):
- S (Small): One focused, contained change. Minimal unknowns. Bug fix, copy change, config update, small UI tweak.
- M (Medium): One coherent feature or deliverable. Clear scope, self-contained. A page, a component, an integration, an API endpoint.
- L (Large): Multiple moving parts, but still one deliverable. Involves coordination across layers. If larger than L, break it further.

CATEGORIES: feature, integration, design, infrastructure, fix, automation, api, internal-tool, refactor

TASK ORDERING: Tasks should be ordered by logical dependency and delivery sequence. Earlier tasks should unblock later ones.

DESCRIPTION RULES:
The description for each task is a mini implementation spec written for the developer building it. Include all that apply:
- Data model: collections/tables, fields, types, relationships
- Files to create or modify (by path if known)
- Sub-screens or steps with inputs, layout, and behavior
- Conditional logic, skip conditions, edge cases
- UI specifics: measurements, colors, breakpoints, responsive behavior
- API surface: endpoint paths, request/response shapes
- Validation rules: required fields, formats, constraints
- Triggered side effects: what other parts of the system update when this completes
Write enough detail that a senior dev unfamiliar with the codebase could build it without asking questions.

ACCEPTANCE CRITERIA RULES:
Acceptance criteria are specific, independently testable conditions. Minimum 4 per task, aim for 5-8.
Each criterion should pass or fail independently. Not "it works" — each isolates one verifiable behavior.

CLIENT DESCRIPTION RULES:
Every task MUST include a clientDescription — a plain-English explanation for a non-technical business owner.
Rules:
- 3-6 short sentences max
- NO jargon: no API, endpoint, schema, Firestore, adapter, pipeline, webhook, middleware
- Explain WHAT it does for the user, not HOW it works
- Use "you/your" to address the end user directly
- ALWAYS include an ASCII art diagram if the feature has any visible UI (max 12 lines, max 40 chars wide, using +, -, |, and plain text)

DEFINITION OF DONE RULES:
Every task MUST include a definitionOfDone — concrete verification steps. Minimum 3 per task.
Include: devices/browsers tested, edge cases exercised, specific scenarios verified, performance thresholds.

WHAT MAKES A TASK TOO LARGE (must be split):
- Contains multiple unrelated outcomes
- Would normally require a full spec before execution
- Spans multiple systems with unclear dependencies
- Sounds like a whole project instead of a deliverable

TASK COUNT:
Do NOT default to 5 tasks. The number of tasks must be driven entirely by the scope of the request.
- A single-screen change or config update: 1-2 tasks
- A feature with frontend + backend: 3-4 tasks
- A multi-screen flow or complex integration: 6-10 tasks
- A large initiative with many moving parts: 10-15 tasks
Count the distinct outcomes. Each outcome is a task. If you find yourself at exactly 5, stop and ask: did I merge things that should be separate, or pad things that should be combined?

Respond with valid JSON matching this schema:
{
  "tasks": [
    {
      "title": "Short descriptive title",
      "description": "Multi-paragraph technical implementation spec",
      "clientDescription": "Plain-English explanation with ASCII art diagram for the business owner",
      "category": "feature|integration|design|infrastructure|fix|automation|api|internal-tool|refactor",
      "size": "S|M|L",
      "acceptance": ["Specific testable condition 1", "Specific testable condition 2"],
      "definitionOfDone": ["Verification step 1", "Verification step 2"]
    }
  ],
  "summary": "One sentence summarizing the overall breakdown",
  "warnings": ["Any concerns about scope, ambiguity, or things that need clarification before work begins"]
}

Don't include project management overhead as tasks. Never mention hours, days, weeks, or any time estimates in any field.`

function sizeToPriority(size: string): "low" | "medium" | "high" {
  if (size === "S") return "low"
  if (size === "L") return "high"
  return "medium"
}

export async function POST(request: NextRequest) {
  const auth = await validateBearerOrAdmin(request)
  if (!auth.authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  try {
    const body = await request.json() as {
      description: string
      projectId?: string
      addToBoard?: boolean
      images?: { data: string; mediaType: string }[]
      existingTasks?: { title: string; status: string; description?: string; tags?: string[] }[]
    }

    if (!body.description || typeof body.description !== "string" || body.description.trim().length < 10) {
      return NextResponse.json(
        { error: "description is required (min 10 characters)" },
        { status: 400 },
      )
    }

    if (body.addToBoard && !body.projectId) {
      return NextResponse.json(
        { error: "projectId is required when addToBoard is true" },
        { status: 400 },
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 },
      )
    }

    // Build existing-tasks context so the AI sizes WITH awareness of what's on the board
    let existingContext = ""
    try {
      const existingTasks = body.existingTasks
      if (existingTasks && Array.isArray(existingTasks) && existingTasks.length > 0) {
        const byStatus: Record<string, typeof existingTasks> = {}
        for (const t of existingTasks) {
          const status = t.status || "unknown"
          const arr = byStatus[status] || (byStatus[status] = [])
          arr.push(t)
        }
        existingContext = `\n\nEXISTING BOARD TASKS (${existingTasks.length} total already on the board):\n`
        for (const [status, tasks] of Object.entries(byStatus)) {
          existingContext += `\n${status.toUpperCase()} (${tasks.length}):\n`
          for (const t of tasks) {
            const tagStr = t.tags && t.tags.length ? ` [${t.tags.join(", ")}]` : ""
            existingContext += `- ${t.title}${tagStr}\n`
            if (t.description) {
              existingContext += `  desc: ${t.description.slice(0, 120)}${t.description.length > 120 ? "..." : ""}\n`
            }
          }
        }
        existingContext += `\nIMPORTANT: Consider these ${existingTasks.length} existing tasks when breaking down the new feature.`
      }
    } catch (ctxErr) {
      console.error("[admin/scope] existingContext build failed:", ctxErr)
      existingContext = ""
    }

    // Safety: cap context to keep prompt under Anthropic limits
    const maxContextChars = 15000
    if (existingContext.length > maxContextChars) {
      existingContext = existingContext.slice(0, maxContextChars) + "\n... (existing tasks truncated for length)"
    }

    // Build multimodal content
    const hasImages = body.images && Array.isArray(body.images) && body.images.length > 0
    const textPart = `Break this feature into standard-sized queue tasks:\n\n${body.description.trim()}${existingContext}`

    const userContent: Array<
      | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
      | { type: "text"; text: string }
    > = []

    if (hasImages) {
      for (const img of body.images!.slice(0, 5)) {
        userContent.push({
          type: "image",
          source: { type: "base64", media_type: img.mediaType, data: img.data },
        })
      }
      userContent.push({
        type: "text",
        text: `The request includes ${body.images!.length} image(s) above — screenshots, mockups, or references. Use them to inform the task breakdown.\n\n${textPart}`,
      })
    } else {
      userContent.push({ type: "text", text: textPart })
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        temperature: 0.5,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContent }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error(`[admin/scope] Anthropic ${response.status}:`, errText.slice(0, 800))
      return NextResponse.json(
        { error: "Failed to analyze feature" },
        { status: 502 },
      )
    }

    const data = await response.json()
    const content = data.content?.[0]?.text
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 502 })
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse AI response" }, { status: 502 })
    }

    let parsed: any
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch (parseErr) {
      console.error("[admin/scope] JSON parse error:", parseErr)
      return NextResponse.json({ error: "AI response was not valid JSON" }, { status: 502 })
    }
    if (!parsed.tasks || !Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
      return NextResponse.json(
        { error: "Could not break this into tasks. Try being more specific." },
        { status: 422 },
      )
    }

    // Optionally create tasks on the board
    if (body.addToBoard && body.projectId) {
      const { db } = getFirebaseAdmin()
      const created: { id: string; taskId: string; title: string }[] = []

      for (const task of parsed.tasks) {
        const taskId = await generateTaskId()
        const acceptance = Array.isArray(task.acceptance)
          ? task.acceptance
          : task.acceptance ? [task.acceptance] : []

        const taskData = buildNewTask({
          taskId,
          title: task.title,
          projectId: body.projectId,
          description: task.description,
          clientDescription: task.clientDescription,
          status: "todo",
          priority: sizeToPriority(task.size),
          tags: task.category ? [task.category] : [],
          acceptanceCriteria: acceptance,
          definitionOfDone: task.definitionOfDone ?? [],
        })

        const ref = await db.collection("tasks").add(taskData)
        await appendHistory(ref.id, {
          actor: auth.actor,
          event: "created",
          details: { title: taskData.title, status: "todo", source: "scope-api" },
        })

        created.push({ id: ref.id, taskId, title: task.title })
      }

      return NextResponse.json({
        ...parsed,
        addedToBoard: true,
        projectId: body.projectId,
        created,
      })
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error("[admin/scope] unexpected error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    )
  }
}
