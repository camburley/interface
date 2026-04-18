import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { WEEKLY_TIMELINE_NOTE } from "@/lib/weekly-report"

type ChatRole = "user" | "assistant"

interface ChatHistoryItem {
  role: ChatRole
  content: string
}

interface ChatRequestBody {
  message: string
  conversationHistory?: ChatHistoryItem[]
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 20
const rateLimitByUser = new Map<string, number[]>()
const TIMELINE_REDIRECT_RESPONSE =
  "Timeline and launch decisions are business decisions on your end. Each task follows a 48-hour SLA. You can count the remaining tasks and calculate based on that pace."
const BUSINESS_REDIRECT_RESPONSE =
  "That is a business decision for your team. I can help you understand what the board shows and what has been built."

function enforceRateLimit(userId: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const existing = rateLimitByUser.get(userId) ?? []
  const recent = existing.filter((timestamp) => timestamp >= windowStart)
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitByUser.set(userId, recent)
    return false
  }
  recent.push(now)
  rateLimitByUser.set(userId, recent)
  return true
}

function sanitizeHistory(history: unknown): ChatHistoryItem[] {
  if (!Array.isArray(history)) return []
  return history
    .filter((item) => {
      if (!item || typeof item !== "object") return false
      const role = (item as ChatHistoryItem).role
      const content = (item as ChatHistoryItem).content
      return (
        (role === "user" || role === "assistant") &&
        typeof content === "string" &&
        content.trim().length > 0
      )
    })
    .map((item) => ({
      role: item.role,
      content: item.content.trim(),
    }))
}

function escapeBlock(value: string | undefined): string {
  return (value ?? "").replace(/\r/g, "").trim()
}

function shouldUseTimelineRedirect(message: string): boolean {
  return /\b(timeline|launch date|delivery date|eta|go live|ship date)\b/i.test(message)
}

function shouldUseBusinessRedirect(message: string): boolean {
  return /\b(pricing|marketing|rollout|go-to-market|business strategy|business decision)\b/i.test(
    message,
  )
}

function createSseMessageResponse(content: string): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "chunk", content })}\n\n`,
        ),
      )
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`),
      )
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Agent not configured" }, { status: 503 })
  }

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  if (!enforceRateLimit(user.uid)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a minute and try again." },
      { status: 429 },
    )
  }

  let body: ChatRequestBody
  try {
    body = (await request.json()) as ChatRequestBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const message = body.message?.trim()
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 })
  }

  if (shouldUseTimelineRedirect(message)) {
    return createSseMessageResponse(TIMELINE_REDIRECT_RESPONSE)
  }

  if (shouldUseBusinessRedirect(message)) {
    return createSseMessageResponse(BUSINESS_REDIRECT_RESPONSE)
  }

  const conversationHistory = sanitizeHistory(body.conversationHistory)

  const { db } = getFirebaseAdmin()
  const clientDoc = await db.collection("clients").doc(user.uid).get()
  if (!clientDoc.exists) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const clientData = clientDoc.data() ?? {}
  const projectId = clientData.milestoneProjectId as string | undefined
  if (!projectId) {
    return NextResponse.json({ error: "No project is linked to this account." }, { status: 400 })
  }

  const [projectDoc, tasksSnap] = await Promise.all([
    db.collection("milestone_projects").doc(projectId).get(),
    db.collection("tasks").where("projectId", "==", projectId).get(),
  ])

  const projectName = (
    projectDoc.data()?.projectName ??
    clientData.projectName ??
    "Project"
  ) as string
  const timelineNote = WEEKLY_TIMELINE_NOTE

  const sortedTasks = tasksSnap.docs
    .map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        taskId: (data.taskId as string | undefined) ?? doc.id,
        title: (data.title as string | undefined) ?? "Untitled task",
        status: (data.status as string | undefined) ?? "unknown",
        description: (data.clientDescription as string | undefined) ?? (data.description as string | undefined) ?? "",
        acceptanceCriteria: Array.isArray(data.acceptanceCriteria)
          ? (data.acceptanceCriteria as string[])
          : [],
        completedAt: (data.completedAt as string | undefined) ?? null,
        dependencies: Array.isArray(data.dependencies)
          ? (data.dependencies as string[])
          : [],
        position: (data.position as number | undefined) ?? Number.MAX_SAFE_INTEGER,
      }
    })
    .sort((a, b) => a.position - b.position)

  const boardContext = [
    `Project ID: ${projectId}`,
    `Project Name: ${projectName}`,
    `Timeline Note: ${timelineNote}`,
    "Tasks:",
    ...sortedTasks.map((task, index) => {
      const acceptance = task.acceptanceCriteria.length
        ? task.acceptanceCriteria.map((item, i) => `      ${i + 1}. ${escapeBlock(item)}`).join("\n")
        : "      - none"
      const dependencies = task.dependencies.length ? task.dependencies.join(", ") : "none"
      const completedAt = task.completedAt ?? "not completed"
      return [
        `  ${index + 1}. ${task.taskId} | ${escapeBlock(task.title)}`,
        `      status: ${task.status}`,
        `      dependencies: ${dependencies}`,
        `      completedAt: ${completedAt}`,
        `      description: ${escapeBlock(task.description) || "none"}`,
        "      acceptanceCriteria:",
        acceptance,
      ].join("\n")
    }),
  ].join("\n")

  const systemPrompt = `You are a project assistant for ${projectName} on Burley.ai. You help clients understand their project board, task status, and what has been built.

You have access to the current board state:
${boardContext}

Your capabilities:
- Explain what any task does and its current status
- Answer what-if questions: "If tasks X and Y are done, will feature Z work?"
- Summarize what was completed recently
- Explain dependencies between tasks
- Clarify what specific completed tasks enable

Your boundaries (HARD RULES - never violate):
- NEVER provide launch dates, delivery dates, or timeline estimates
- NEVER make business decisions (pricing, marketing, rollout timing)
- NEVER promise when specific tasks will be completed
- NEVER suggest changing task priorities or scope
- If asked about timelines, respond: "Timeline and launch decisions are business decisions on your end. Each task follows a 48-hour SLA. You can count the remaining tasks and calculate based on that pace."
- If asked about business strategy, respond: "That is a business decision for your team. I can help you understand what the board shows and what has been built."

Tone: Professional, helpful, concise. Use the board data to give concrete answers. Reference specific task IDs when relevant.`

  const anthropic = new Anthropic({ apiKey })
  const messages: Array<{ role: ChatRole; content: string }> = [
    ...conversationHistory,
    { role: "user", content: message },
  ]

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8192,
          stream: true,
          system: systemPrompt,
          messages,
        })

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const delta = event.delta.text
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "chunk", content: delta })}\n\n`),
            )
          }
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`),
        )
      } catch (error) {
        console.error("[client-agent-chat] streaming error:", error)
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: "Failed to stream response." })}\n\n`,
          ),
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
