import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { backfillTaskStoryId } from "@/lib/backfill-task-story-id"

/**
 * POST /api/admin/backfill-task-story-id
 * One-time backfill: set task.storyId for all tasks that match a story (by history, milestoneId+title, or projectId+title).
 * Uses the same Firebase as the app (production when deployed). Call once after deploy to fix milestone–board sync.
 */
export async function POST(request: NextRequest) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  try {
    const { db } = getFirebaseAdmin()
    const result = await backfillTaskStoryId(db)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("[backfill-task-story-id]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Backfill failed" },
      { status: 500 },
    )
  }
}
