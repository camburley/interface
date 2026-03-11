import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { appendHistory } from "@/lib/task-utils"
import { validateTransition } from "@/lib/workflow"
import type { Task, TaskStatus } from "@/lib/types/task"

interface RouteContext {
  params: Promise<{ taskId: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { taskId } = await context.params
  const body = await request.json()
  const { status: newStatus, actor, evidence } = body as {
    status: TaskStatus
    actor?: string
    evidence?: string[]
  }

  if (!newStatus) {
    return NextResponse.json(
      { error: "status is required" },
      { status: 400 },
    )
  }

  const { db } = getFirebaseAdmin()
  const ref = db.collection("tasks").doc(taskId)
  const doc = await ref.get()
  if (!doc.exists)
    return NextResponse.json({ error: "Task not found" }, { status: 404 })

  const task = { id: doc.id, ...doc.data() } as Task
  const result = validateTransition(task, newStatus, actor)

  if (!result.valid) {
    return NextResponse.json(
      { error: "Invalid transition", details: result.errors },
      { status: 422 },
    )
  }

  const updates: Record<string, unknown> = {
    status: newStatus,
    updatedAt: new Date().toISOString(),
  }

  if (newStatus === "done") {
    updates.completedAt = new Date().toISOString()
  } else if (task.completedAt) {
    updates.completedAt = null
  }

  await ref.update(updates)

  await appendHistory(taskId, {
    actor: actor ?? "admin",
    event: "status_changed",
    details: {
      from: task.status,
      to: newStatus,
      evidence: evidence ?? [],
    },
  })

  return NextResponse.json({
    ok: true,
    id: taskId,
    from: task.status,
    to: newStatus,
  })
}
