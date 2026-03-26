import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { computeNextDue } from "@/lib/types/task"
import type { Task } from "@/lib/types/task"

/**
 * GET /api/admin/tasks/reset-recurring
 *
 * Idempotent endpoint called by heartbeat/cron.
 * 1. Resets done recurring cards back to "todo" when past nextDue.
 * 2. Resets todayCount to 0 when lastReset date !== today (ET).
 */
export async function GET(request: NextRequest) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { db } = getFirebaseAdmin()
  const now = new Date().toISOString()
  const todayET = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
  )
    .toISOString()
    .slice(0, 10)

  const snap = await db
    .collection("tasks")
    .where("cardType", "==", "recurring")
    .get()

  const reset: string[] = []
  const dailyReset: string[] = []

  const batch = db.batch()
  for (const doc of snap.docs) {
    const task = { id: doc.id, ...doc.data() } as Task
    const rec = task.recurrence
    if (!rec) continue

    const needsDailyReset =
      (rec.lastReset ?? "") !== todayET && (rec.todayCount ?? 0) > 0

    if (needsDailyReset) {
      batch.update(doc.ref, {
        "recurrence.todayCount": 0,
        "recurrence.lastReset": todayET,
        updatedAt: now,
      })
      dailyReset.push(task.taskId)
    }

    if (task.status === "done" && rec.nextDue && rec.nextDue <= now) {
      batch.update(doc.ref, {
        status: "todo",
        completedAt: null,
        "recurrence.nextDue": computeNextDue(rec.frequency),
        updatedAt: now,
      })
      reset.push(task.taskId)
    }
  }

  if (reset.length > 0 || dailyReset.length > 0) {
    await batch.commit()
  }

  return NextResponse.json({
    ok: true,
    reset,
    resetCount: reset.length,
    dailyReset,
    dailyResetCount: dailyReset.length,
  })
}
