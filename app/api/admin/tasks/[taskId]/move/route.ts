import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { appendHistory } from "@/lib/task-utils"
import { validateTransition } from "@/lib/workflow"
import { taskStatusToStoryStatus } from "@/lib/sync-status"
import { computeNextDue } from "@/lib/types/task"
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
  const { status: newStatus, actor, evidence, comment } = body as {
    status: TaskStatus
    actor?: string
    evidence?: string[]
    comment?: string
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
  const isRecurringDone =
    newStatus === "done" && task.cardType === "recurring" && task.recurrence

  if (isRecurringDone && (!comment || comment.trim().length < 10)) {
    return NextResponse.json(
      { error: "Recurring tasks require a completion comment (min 10 chars)" },
      { status: 400 },
    )
  }

  const result = validateTransition(task, newStatus, actor)

  if (!result.valid) {
    return NextResponse.json(
      { error: "Invalid transition", details: result.errors },
      { status: 422 },
    )
  }

  const now = new Date().toISOString()
  const updates: Record<string, unknown> = {
    status: newStatus,
    updatedAt: now,
  }

  if (newStatus === "done") {
    updates.completedAt = now

    if (isRecurringDone) {
      const newStreak = (task.recurrence!.streak ?? 0) + 1
      updates["recurrence.lastCompleted"] = now
      updates["recurrence.streak"] = newStreak
      updates["recurrence.nextDue"] = computeNextDue(task.recurrence!.frequency)
      updates["recurrence.todayCount"] = (task.recurrence!.todayCount ?? 0) + 1

      const entry = {
        completedAt: now,
        actor: actor ?? "admin",
        comment: comment!.trim(),
        cycleNumber: newStreak,
      }
      const existingLog = task.recurrence!.completionLog ?? []
      updates["recurrence.completionLog"] = [...existingLog, entry]
    }
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

  if (task.storyId) {
    try {
      const storyStatus = taskStatusToStoryStatus(newStatus)
      const storyRef = db.collection("stories").doc(task.storyId)
      const storyUpdates: Record<string, unknown> = {
        status: storyStatus,
        completedAt: storyStatus === "done" ? new Date().toISOString() : null,
      }
      await storyRef.update(storyUpdates)
    } catch (err) {
      console.error("[task-move-sync] story dual-write failed:", err)
    }
  }

  return NextResponse.json({
    ok: true,
    id: taskId,
    from: task.status,
    to: newStatus,
  })
}
