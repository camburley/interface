import { NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { storyStatusToTaskStatus } from "@/lib/sync-status"
import { generateTaskId, buildNewTask, appendHistory } from "@/lib/task-utils"

interface RouteContext {
  params: Promise<{ milestoneId: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { milestoneId } = await context.params
  const { db } = getFirebaseAdmin()

  const snap = await db.collection("stories").where("milestoneId", "==", milestoneId).get()
  const stories = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => ((a as Record<string, string>).createdAt ?? "").localeCompare((b as Record<string, string>).createdAt ?? ""))

  return NextResponse.json({ stories })
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { milestoneId } = await context.params
  const body = await request.json()
  const { title, notes, outputUrl, specUrl, placeholder, kind } = body

  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 })

  const { db } = getFirebaseAdmin()

  const milestoneDoc = await db.collection("milestones").doc(milestoneId).get()
  if (!milestoneDoc.exists) return NextResponse.json({ error: "Milestone not found" }, { status: 404 })

  const data: Record<string, unknown> = {
    milestoneId,
    projectId: milestoneDoc.data()!.projectId,
    title,
    status: "todo",
    placeholder: Boolean(placeholder),
    notes: notes ?? "",
    outputUrl: outputUrl ?? null,
    specUrl: specUrl ?? null,
    attachments: [],
    createdAt: new Date().toISOString(),
    completedAt: null,
  }
  if (kind) data.kind = kind

  const ref = await db.collection("stories").add(data)

  // AUTO-LINK: Create a board task linked to this story
  let taskDocId: string | null = null
  try {
    // Check if a task with this exact title already exists in the project
    const projectId = milestoneDoc.data()!.projectId as string
    const existingTasks = await db
      .collection("tasks")
      .where("milestoneId", "==", milestoneId)
      .get()
    const titleNorm = title.trim().toLowerCase()
    const match = existingTasks.docs.find(
      (d) => (d.data().title as string)?.trim().toLowerCase() === titleNorm,
    )

    if (match) {
      // Link existing task to this story
      await match.ref.update({ storyId: ref.id })
      taskDocId = match.id
    } else {
      // Create a new task
      const taskId = await generateTaskId()
      const taskStatus = storyStatusToTaskStatus("todo")
      const taskData = buildNewTask({
        taskId,
        title,
        projectId,
        description: notes ?? "",
        status: taskStatus,
        milestoneId,
        specUrl: specUrl ?? undefined,
        outputUrl: outputUrl ?? undefined,
      })
      // Add storyId link
      const taskRef = await db.collection("tasks").add({ ...taskData, storyId: ref.id })
      taskDocId = taskRef.id

      await appendHistory(taskRef.id, {
        actor: "auto-sync",
        event: "created",
        details: {
          title,
          status: taskStatus,
          originalStoryId: ref.id,
          source: "story-auto-link",
        },
      })
    }
  } catch (err) {
    console.error("[story-create-auto-link] task creation failed:", err)
  }

  return NextResponse.json({ ok: true, id: ref.id, taskId: taskDocId })
}
