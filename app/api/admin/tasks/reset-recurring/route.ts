import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { computeNextDue } from "@/lib/types/task"
import type { Task } from "@/lib/types/task"

/**
 * GET /api/admin/tasks/reset-recurring
 *
 * Idempotent endpoint called by heartbeat/cron.
 * Finds recurring tasks that are "done" and past their nextDue,
 * then resets them back to "todo" for the next cycle.
 */
export async function GET(request: NextRequest) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { db } = getFirebaseAdmin()
  const now = new Date().toISOString()

  const snap = await db
    .collection("tasks")
    .where("cardType", "==", "recurring")
    .where("status", "==", "done")
    .get()

  const reset: string[] = []

  const batch = db.batch()
  for (const doc of snap.docs) {
    const task = { id: doc.id, ...doc.data() } as Task
    const nextDue = task.recurrence?.nextDue
    if (!nextDue || nextDue > now) continue

    batch.update(doc.ref, {
      status: "todo",
      completedAt: null,
      "recurrence.nextDue": computeNextDue(task.recurrence!.frequency),
      updatedAt: now,
    })

    reset.push(task.taskId)
  }

  if (reset.length > 0) {
    await batch.commit()
  }

  return NextResponse.json({ ok: true, reset, count: reset.length })
}
