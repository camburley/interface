import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { backfillTaskStoryId } from "@/lib/backfill-task-story-id"

/**
 * POST /api/admin/backfill-task-story-id
 * Backfill task.storyId so milestone–board sync finds tasks. Body: { "force": true } to re-match all by title (overwrites existing storyId).
 */
export async function POST(request: NextRequest) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  try {
    const body = await request.json().catch(() => ({})) as { force?: boolean }
    const { db } = getFirebaseAdmin()
    const result = await backfillTaskStoryId(db, { force: body.force === true })
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("[backfill-task-story-id]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Backfill failed" },
      { status: 500 },
    )
  }
}
