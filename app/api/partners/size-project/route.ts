import { NextResponse } from "next/server"

interface SizedTask {
  title: string
  description: string
  category: string
  size: "S" | "M" | "L"
  acceptance: string
}

interface SizeProjectResponse {
  tasks: SizedTask[]
  summary: string
  warnings: string[]
}

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

WHAT MAKES A TASK TOO LARGE (must be split):
- Contains multiple unrelated outcomes
- Would normally require a full spec before execution
- Spans multiple systems with unclear dependencies
- Sounds like a whole project instead of a deliverable

EXAMPLE - "Build me a client portal" becomes:
1. Define MVP scope and data model
2. Create auth flow (login, register, password reset)
3. Build dashboard shell and navigation
4. Implement account settings page
5. Build first reporting/data view
6. Connect billing/payment area
7. QA pass and release checklist

Respond with valid JSON matching this schema:
{
  "tasks": [
    {
      "title": "Short descriptive title",
      "description": "What this task delivers in 1-2 sentences",
      "category": "feature|integration|design|infrastructure|fix|automation|api|internal-tool|refactor",
      "size": "S|M|L",
      "acceptance": "How we know this task is done"
    }
  ],
  "summary": "One sentence summarizing the overall breakdown",
  "warnings": ["Any concerns about scope, ambiguity, or things that need clarification before work begins"]
}

Keep task count realistic. Most projects break into 4-12 tasks. Don't pad with unnecessary items. Don't include project management overhead as tasks. Never mention hours, days, weeks, or any time estimates in any field.`

export async function POST(request: Request) {
  try {
    const { description } = await request.json()

    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a project description (at least 10 characters)." },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured." },
        { status: 503 }
      )
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Break this project into standard-sized queue tasks:\n\n${description.trim()}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("OpenAI API error:", err)
      return NextResponse.json(
        { error: "Failed to analyze project. Please try again." },
        { status: 502 }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI. Please try again." },
        { status: 502 }
      )
    }

    const parsed: SizeProjectResponse = JSON.parse(content)

    if (!parsed.tasks || !Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
      return NextResponse.json(
        { error: "Could not break this into tasks. Try being more specific." },
        { status: 422 }
      )
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error("Size project error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
