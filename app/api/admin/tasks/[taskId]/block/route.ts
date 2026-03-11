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
  const { reason, actor } = body as { reason: string; actor?: string }

  if (!reason) {
    return NextResponse.json(
      { error: "reason is required" },
      { status: 400 },
    )
  }

  const { db } = getFirebaseAdmin()
  const ref = db.collection("tasks").doc(taskId)
  const doc = await ref.get()
  if (!doc.exists)
    return NextResponse.json({ error: "Task not found" }, { status: 404 })

  const task = { id: doc.id, ...doc.data() } as Task
  const result = validateTransition(task, "blocked", actor)

  if (!result.valid) {
    return NextResponse.json(
      { error: "Cannot block this task", details: result.errors },
      { status: 422 },
    )
  }

  await ref.update({
    status: "blocked",
    updatedAt: new Date().toISOString(),
  })

  await appendHistory(taskId, {
    actor: actor ?? "admin",
    event: "blocked",
    details: { reason, previousStatus: task.status },
  })

  return NextResponse.json({ ok: true, id: taskId, status: "blocked" })
}
