import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { appendHistory } from "@/lib/task-utils"
import { validateTransition } from "@/lib/workflow"
import type { Task } from "@/lib/types/task"

interface RouteContext {
  params: Promise<{ taskId: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { taskId } = await context.params
  const body = await request.json()
  const { evidence, actor, confidence } = body as {
    evidence?: string[]
    actor?: string
    confidence?: number
  }

  const { db } = getFirebaseAdmin()
  const ref = db.collection("tasks").doc(taskId)
  const doc = await ref.get()
  if (!doc.exists)
    return NextResponse.json({ error: "Task not found" }, { status: 404 })

  const task = { id: doc.id, ...doc.data() } as Task
  const result = validateTransition(task, "done", actor)

  if (!result.valid) {
    return NextResponse.json(
      { error: "Cannot complete this task", details: result.errors },
      { status: 422 },
    )
  }

  const now = new Date().toISOString()
  await ref.update({
    status: "done",
    completedAt: now,
    updatedAt: now,
  })

  await appendHistory(taskId, {
    actor: actor ?? "admin",
    event: "task_completed",
    inputs: evidence,
    confidence,
    details: { previousStatus: task.status },
  })

  return NextResponse.json({
    ok: true,
    id: taskId,
    status: "done",
    completedAt: now,
  })
}
