import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { generateTaskId, buildNewTask, appendHistory } from "@/lib/task-utils"

interface RouteContext {
  params: Promise<{ taskId: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { taskId } = await context.params
  const body = await request.json()
  const { subtasks, actor } = body as {
    subtasks: { title: string; description?: string; priority?: string }[]
    actor?: string
  }

  if (!subtasks || !Array.isArray(subtasks) || subtasks.length === 0) {
    return NextResponse.json(
      { error: "subtasks array is required and must be non-empty" },
      { status: 400 },
    )
  }

  const { db } = getFirebaseAdmin()
  const parentRef = db.collection("tasks").doc(taskId)
  const parentDoc = await parentRef.get()
  if (!parentDoc.exists)
    return NextResponse.json({ error: "Task not found" }, { status: 404 })

  const parentData = parentDoc.data()!
  const createdIds: { id: string; taskId: string; title: string }[] = []

  for (const sub of subtasks) {
    const newTaskId = await generateTaskId()
    const taskData = buildNewTask({
      taskId: newTaskId,
      title: sub.title,
      description: sub.description ?? "",
      projectId: parentData.projectId,
      milestoneId: parentData.milestoneId,
      parentTaskId: taskId,
      priority: (sub.priority as "low" | "medium" | "high" | "urgent") ??
        parentData.priority,
      tags: parentData.tags ?? [],
      sprint: parentData.sprint,
    })

    const ref = await db.collection("tasks").add(taskData)
    createdIds.push({ id: ref.id, taskId: newTaskId, title: sub.title })

    await appendHistory(ref.id, {
      actor: actor ?? "admin",
      event: "created",
      details: { spawned_from: taskId, title: sub.title },
    })
  }

  await appendHistory(taskId, {
    actor: actor ?? "admin",
    event: "split",
    details: {
      childCount: createdIds.length,
      children: createdIds.map((c) => c.taskId),
    },
  })

  await parentRef.update({ updatedAt: new Date().toISOString() })

  return NextResponse.json({ ok: true, parentId: taskId, children: createdIds })
}
