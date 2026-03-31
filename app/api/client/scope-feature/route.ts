import { NextRequest, NextResponse } from "next/server"
import { validateClientSession } from "@/lib/client-auth"
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

WHAT MAKES A TASK TOO LARGE (must be split):
- Contains multiple unrelated outcomes
- Would normally require a full spec before execution
- Spans multiple systems with unclear dependencies
- Sounds like a whole project instead of a deliverable

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

const REPO_CONTEXT_ADDON = `

IMPORTANT: You have been given the repository's file tree (and possibly key files) as context. Use this to:
- Reference existing files/directories in task descriptions when relevant
- Suggest where new code should live based on existing structure
- Flag integration points with existing code
- Avoid duplicating functionality that already exists
Do NOT list every file — only reference files that are directly relevant to a task.`

export async function POST(request: NextRequest) {
  const session = await validateClientSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  try {
    const { description } = await request.json()

    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a feature description (at least 10 characters)." },
        { status: 400 },
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured." },
        { status: 503 },
      )
    }

    let repoContext = ""
    try {
      const { db } = getFirebaseAdmin()
      const clientSnap = await db
        .collection("clients")
        .where("uid", "==", session.uid)
        .limit(1)
        .get()

      if (!clientSnap.empty) {
        const clientData = clientSnap.docs[0].data()
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

    const systemPrompt = repoContext
      ? SYSTEM_PROMPT + REPO_CONTEXT_ADDON
      : SYSTEM_PROMPT

    const userMessage = repoContext
      ? `Break this feature into standard-sized queue tasks:\n\n${description.trim()}${repoContext}`
      : `Break this feature into standard-sized queue tasks:\n\n${description.trim()}`

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
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      console.error("[scope-feature] OpenAI error:", await response.text())
      return NextResponse.json(
        { error: "Failed to analyze feature. Please try again." },
        { status: 502 },
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI. Please try again." },
        { status: 502 },
      )
    }

    const parsed = JSON.parse(content)

    if (!parsed.tasks || !Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
      return NextResponse.json(
        { error: "Could not break this into tasks. Try being more specific." },
        { status: 422 },
      )
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error("[scope-feature] error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }
}
