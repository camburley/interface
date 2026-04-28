import { NextRequest, NextResponse } from "next/server"
import { validateClientSession } from "@/lib/client-auth"
import { getSessionUser, isAdmin } from "@/lib/session"
import { getFirebaseAdmin } from "@/lib/firebase-admin"

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

EXISTING TO DO BOARD RULES:
- Treat the current To Do list as the source of truth for planned work.
- Before creating any new task, compare the request against every existing To Do task.
- If the new request overlaps with an existing To Do task, prefer updating or replacing that existing task instead of creating a duplicate.
- If an existing To Do task becomes unnecessary, contradictory, or too vague because of the new request, call that out as a delete or replace action.
- The "newTasks" array is ONLY for net-new tasks that should be added to the board.
- If the request is fully covered by changes to existing To Do tasks, return an empty "newTasks" array.
- Use "boardActions" for relevant existing To Do tasks that should be updated, replaced, deleted, or intentionally kept.
- Do not list every existing task as "keep"; only include "keep" when it clarifies why a related task should remain unchanged.
- The final board should read like one cohesive implementation plan with no duplicate cards and no conflicting directions.

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
  "newTasks": [
    {
      "title": "Short descriptive title",
      "description": "Multi-paragraph technical implementation spec",
      "clientDescription": "Plain-English explanation with ASCII art diagram for the business owner",
      "category": "feature|integration|design|infrastructure|fix|automation|api|internal-tool|refactor",
      "size": "S|M|L",
      "acceptance": ["Specific testable condition 1", "Specific testable condition 2"],
      "definitionOfDone": ["Verification step 1", "Verification step 2"],
      "dependsOnExisting": ["(optional) Titles of existing board tasks this depends on"]
    }
  ],
  "boardActions": [
    {
      "action": "update|replace|delete|keep",
      "taskId": "Existing board task id if provided",
      "task": "Existing task title",
      "reason": "Why this action keeps the board cohesive",
      "replacementTask": "(for replace) Full new task object with title, description, clientDescription, category, size, acceptance, definitionOfDone",
      "updatedFields": "(for update) Object with only the fields that should change: title, description, clientDescription, tags, priority, acceptanceCriteria, definitionOfDone"
    }
  ],
  "summary": "One sentence summarizing the overall breakdown",
  "warnings": ["Any concerns about scope, ambiguity, or things that need clarification before work begins"]
}

Don't include project management overhead as tasks. Never mention hours, days, weeks, or any time estimates in any field.`

const REPO_CONTEXT_ADDON = `

IMPORTANT: You have been given the repository's file tree (and possibly key files) as context. Use this to:
- Reference existing files/directories in task descriptions when relevant
- Suggest where new code should live based on existing structure
- Flag integration points with existing code
- Avoid duplicating functionality that already exists
Do NOT list every file — only reference files that are directly relevant to a task.`

const TASK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "description", "clientDescription", "category", "size", "acceptance", "definitionOfDone"],
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    clientDescription: { type: "string" },
    category: {
      type: "string",
      enum: ["feature", "integration", "design", "infrastructure", "fix", "automation", "api", "internal-tool", "refactor"],
    },
    size: { type: "string", enum: ["S", "M", "L"] },
    acceptance: { type: "array", minItems: 1, items: { type: "string" } },
    definitionOfDone: { type: "array", minItems: 1, items: { type: "string" } },
    dependsOnExisting: { type: "array", items: { type: "string" } },
  },
} as const

const TASK_BREAKDOWN_TOOL = {
  name: "format_task_breakdown",
  description: "Return the scoped task breakdown in the exact structure used by the client board.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["newTasks", "boardActions", "summary", "warnings"],
    properties: {
      newTasks: {
        type: "array",
        items: TASK_SCHEMA,
      },
      boardActions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["action", "task", "reason"],
          properties: {
            action: { type: "string", enum: ["update", "replace", "delete", "keep"] },
            taskId: { type: "string" },
            task: { type: "string" },
            reason: { type: "string" },
            updatedFields: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                clientDescription: { type: "string" },
                tags: { type: "array", items: { type: "string" } },
                priority: { type: "string", enum: ["low", "medium", "high"] },
                acceptanceCriteria: { type: "array", items: { type: "string" } },
                definitionOfDone: { type: "array", items: { type: "string" } },
              },
            },
            replacementTask: TASK_SCHEMA,
          },
        },
      },
      summary: { type: "string" },
      warnings: { type: "array", items: { type: "string" } },
    },
  },
} as const

async function getAuthorizedSession(): Promise<{ uid: string; projectId?: string } | null> {
  const clientSession = await validateClientSession()
  if (clientSession) return { uid: clientSession.uid, projectId: clientSession.projectId }

  const user = await getSessionUser()
  if (user && isAdmin(user.uid)) return { uid: user.uid }

  return null
}

export async function POST(request: NextRequest) {
  const session = await getAuthorizedSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  try {
    const body = await request.json() as {
      description: string
      images?: { data: string; mediaType: string }[]
      existingTasks?: {
        id?: string
        taskId?: string
        title: string
        status: string
        description?: string
        tags?: string[]
      }[]
    }
    const { description, images, existingTasks } = body

    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a feature description (at least 10 characters)." },
        { status: 400 },
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured." },
        { status: 503 },
      )
    }

    let repoContext = ""
    try {
      const { db } = getFirebaseAdmin()

      const clientDoc = await db.collection("clients").doc(session.uid).get()
      if (clientDoc.exists) {
        const clientData = clientDoc.data()!
        const githubRepo = clientData.githubRepo as string | undefined
        const githubPat = clientData.githubPat as string | undefined

        if (githubRepo && githubPat) {
          const treeRes = await fetch(
            `https://api.github.com/repos/${githubRepo}/git/trees/main?recursive=1`,
            {
              headers: {
                Authorization: `Bearer ${githubPat}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "burley-scoping",
              },
            },
          )

          if (treeRes.ok) {
            const treeData = await treeRes.json()
            const paths = (treeData.tree as { path: string; type: string }[])
              .filter((n) => n.type === "blob")
              .map((n) => n.path)
              .filter((p) => !p.includes("node_modules/") && !p.includes(".git/") && !p.includes("dist/"))
              .slice(0, 500)

            repoContext = `\n\nREPOSITORY FILE TREE (${githubRepo}):\n${paths.join("\n")}`

            const keyFiles = ["README.md", "package.json", "tsconfig.json"]
            for (const kf of keyFiles) {
              if (!paths.includes(kf)) continue
              try {
                const fileRes = await fetch(
                  `https://api.github.com/repos/${githubRepo}/contents/${kf}`,
                  {
                    headers: {
                      Authorization: `Bearer ${githubPat}`,
                      Accept: "application/vnd.github.v3.raw",
                      "User-Agent": "burley-scoping",
                    },
                  },
                )
                if (fileRes.ok) {
                  const content = await fileRes.text()
                  repoContext += `\n\n--- ${kf} ---\n${content.slice(0, 3000)}`
                }
              } catch {
                // skip individual file fetch failures
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("[scope-feature] repo context fetch failed:", err)
    }

    // Build To Do context so the AI sizes against the planned board, not in isolation.
    let existingContext = ""
    try {
      if (existingTasks && Array.isArray(existingTasks) && existingTasks.length > 0) {
        const todoTasks = existingTasks.filter((t) => t.status === "todo")

        existingContext = `\n\nEXISTING TO DO TASKS (${todoTasks.length} already planned on the board):\n`
        for (const t of todoTasks) {
          const identifier = t.taskId || t.id || "unlabeled"
          const tagStr = t.tags && t.tags.length ? ` [${t.tags.join(", ")}]` : ""
          existingContext += `- ${identifier}: ${t.title}${tagStr}\n`
          if (t.description) {
            existingContext += `  desc: ${t.description.slice(0, 220)}${t.description.length > 220 ? "..." : ""}\n`
          }
        }
        existingContext += `\nIMPORTANT: Compare the new request against these To Do items first. Do not add duplicates. Return existing-task changes in boardActions, and return only genuinely new tasks in newTasks.`
      }
    } catch (ctxErr) {
      console.error("[scope-feature] existingContext build failed:", ctxErr)
      existingContext = "" // fail safe — proceed without context
    }

    // Safety: cap repo/existing context to keep prompt under Anthropic limits
    const maxContextChars = 8000
    if (existingContext.length > maxContextChars) {
      existingContext = existingContext.slice(0, maxContextChars) + "\n... (existing tasks truncated for length)"
    }
    if (repoContext.length > maxContextChars) {
      repoContext = repoContext.slice(0, maxContextChars) + "\n... (repo context truncated for length)"
    }

    const systemPrompt = repoContext
      ? SYSTEM_PROMPT + REPO_CONTEXT_ADDON
      : SYSTEM_PROMPT

    const textPart = `Break this feature into standard-sized queue tasks:\n\n${description.trim()}${existingContext}${repoContext}`

    const hasImages = images && Array.isArray(images) && images.length > 0

    // Build multimodal content array for Claude
    const userContent: Array<
      | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
      | { type: "text"; text: string }
    > = []

    if (hasImages) {
      for (const img of images.slice(0, 20)) {
        userContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: img.mediaType,
            data: img.data,
          },
        })
      }
      userContent.push({
        type: "text",
        text: `The client attached ${images.length} image(s) above — these are screenshots, mockups, or references for what they want built. Use them to inform the task breakdown.\n\n${textPart}`,
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
        model: "claude-opus-4-6",
        max_tokens: 40000,
        temperature: 0.5,
        system: systemPrompt,
        tools: [TASK_BREAKDOWN_TOOL],
        tool_choice: { type: "tool", name: TASK_BREAKDOWN_TOOL.name },
        messages: [
          { role: "user", content: userContent },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error(`[scope-feature] Anthropic ${response.status}:`, errText.slice(0, 800))
      return NextResponse.json(
        { error: "Failed to analyze feature. Please try again." },
        { status: 502 },
      )
    }

    const data = await response.json()
    const contentBlocks = Array.isArray(data.content) ? data.content : []
    const toolUse = contentBlocks.find(
      (block: any) => block?.type === "tool_use" && block?.name === TASK_BREAKDOWN_TOOL.name,
    )

    let parsed: any = toolUse?.input

    // Fallback for older/free-text Anthropic responses. The forced tool call should be the normal path.
    if (!parsed) {
      const content = contentBlocks.find((block: any) => block?.type === "text")?.text
      if (!content) {
        return NextResponse.json(
          { error: "No response from AI. Please try again." },
          { status: 502 },
        )
      }

      let jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (!jsonMatch) {
        jsonMatch = content.match(/\{[\s\S]*\}/)
      } else {
        jsonMatch = [jsonMatch[1]]
      }
      if (!jsonMatch) {
        console.error("[scope-feature] no JSON in response. First 500 chars:", content.slice(0, 500))
        return NextResponse.json(
          { error: "Could not parse AI response. Please try again." },
          { status: 502 },
        )
      }

      let jsonStr = jsonMatch[0]
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, "$1")

      try {
        parsed = JSON.parse(jsonStr)
      } catch (parseErr) {
        console.error("[scope-feature] JSON parse failed. First 500 chars of match:", jsonStr.slice(0, 500))
        return NextResponse.json(
          { error: "AI response was not valid JSON. Please try again." },
          { status: 502 },
        )
      }
    }

    // Normalize: accept newTasks or legacy tasks field
    if (Array.isArray(parsed.newTasks)) {
      // canonical field present
    } else if (Array.isArray(parsed.tasks)) {
      parsed.newTasks = parsed.tasks
      delete parsed.tasks
    } else if (Array.isArray(parsed.boardActions)) {
      parsed.newTasks = []
    } else {
      console.error("[scope-feature] parsed response missing newTasks/tasks:", {
        topLevelKeys: parsed && typeof parsed === "object" ? Object.keys(parsed) : [],
        contentBlockTypes: contentBlocks.map((block: any) => block?.type).filter(Boolean),
        hasToolUse: !!toolUse,
      })
      return NextResponse.json(
        { error: "Could not read the AI task breakdown. Please try again." },
        { status: 422 },
      )
    }
    if (!Array.isArray(parsed.boardActions)) parsed.boardActions = []
    if (!Array.isArray(parsed.warnings)) parsed.warnings = []

    return NextResponse.json({
      newTasks: parsed.newTasks,
      boardActions: parsed.boardActions,
      summary: parsed.summary ?? "",
      warnings: parsed.warnings,
    })
  } catch (error) {
    console.error("[scope-feature] unexpected error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }
}
