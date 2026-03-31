import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import {
  generateTaskId,
  buildNewTask,
  appendHistory,
  fetchTasksFromFirestore,
} from "@/lib/task-utils"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { taskStatusToStoryStatus } from "@/lib/sync-status"
import type { TaskStatus } from "@/lib/types/task"

export async function GET(request: NextRequest) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const params = request.nextUrl.searchParams
  const filters: {
    projectId?: string
    milestoneId?: string
    status?: TaskStatus
    assignee?: string
  } = {}

  if (params.get("projectId")) filters.projectId = params.get("projectId")!
  if (params.get("milestoneId"))
    filters.milestoneId = params.get("milestoneId")!
  if (params.get("status")) filters.status = params.get("status") as TaskStatus
  if (params.get("assignee")) filters.assignee = params.get("assignee")!

  const tasks = await fetchTasksFromFirestore(filters)

  tasks.sort(
    (a, b) => (a.position ?? 99999) - (b.position ?? 99999),
  )

  return NextResponse.json({ tasks })
}

export async function POST(request: NextRequest) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const body = await request.json()

  if (!body.title || !body.projectId) {
    return NextResponse.json(
      { error: "title and projectId are required" },
      { status: 400 },
    )
  }

  const taskId = await generateTaskId()
  const taskData = buildNewTask({ ...body, taskId })

  const { db } = getFirebaseAdmin()
  const ref = await db.collection("tasks").add(taskData)

  await appendHistory(ref.id, {
    actor: body.actor ?? "admin",
    event: "created",
    details: { title: taskData.title, status: taskData.status },
  })

  // AUTO-LINK: If task has a milestoneId, auto-create or link a story
  let storyId: string | null = body.storyId ?? null
  if (!storyId && taskData.milestoneId) {
    try {
      // Check if a story with this exact title already exists in the milestone
      const existingStories = await db
        .collection("stories")
        .where("milestoneId", "==", taskData.milestoneId)
        .get()
      const titleNorm = taskData.title.trim().toLowerCase()
      const match = existingStories.docs.find(
        (d) => (d.data().title as string)?.trim().toLowerCase() === titleNorm,
      )

      if (match) {
        // Link to existing story
        storyId = match.id
      } else {
        // Create a new story
        const storyStatus = taskStatusToStoryStatus(taskData.status as TaskStatus)
        const storyData = {
          milestoneId: taskData.milestoneId,
          projectId: taskData.projectId,
          title: taskData.title,
          status: storyStatus,
          placeholder: false,
          notes: taskData.description ?? "",
          outputUrl: taskData.outputUrl ?? null,
          specUrl: taskData.specUrl ?? null,
          attachments: [],
          createdAt: taskData.createdAt,
          completedAt: storyStatus === "done" ? taskData.completedAt : null,
        }
        const storyRef = await db.collection("stories").add(storyData)
        storyId = storyRef.id
      }

      // Link task to story
      await ref.update({ storyId })
    } catch (err) {
      console.error("[task-create-auto-link] story creation failed:", err)
    }
  }

  if (taskData.description && !body.clientDescription) {
    generateClientDescription(ref.id, taskData.title, taskData.description).catch((err) =>
      console.error("[task-create] clientDescription generation failed:", err)
    )
  }

  return NextResponse.json({ ok: true, id: ref.id, taskId, storyId })
}

async function generateClientDescription(docId: string, title: string, description: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 600,
      messages: [
        {
          role: "system",
          content: `You translate technical software task descriptions into plain English that a non-technical business owner can understand. Rules:
- Write 3-6 short sentences max
- No jargon: no "API", "endpoint", "schema", "Firestore", "Zod", "adapter", "pipeline"
- Explain WHAT it does for the user, not HOW it works internally
- If the feature has a visual component, include a simple ASCII art diagram (use +, -, |, and plain text)
- Keep ASCII art small (max 8 lines, max 40 chars wide)
- Start with a one-line plain English summary
- Use "you/your" to address the end user directly`,
        },
        {
          role: "user",
          content: `Task: ${title}\n\nTechnical description:\n${description}`,
        },
      ],
    }),
  })

  if (!res.ok) return

  const data = await res.json()
  const clientDescription = data.choices?.[0]?.message?.content?.trim()
  if (!clientDescription) return

  const { db } = getFirebaseAdmin()
  await db.collection("tasks").doc(docId).update({ clientDescription })
}
