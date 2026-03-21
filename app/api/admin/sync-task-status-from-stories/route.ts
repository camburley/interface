import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { syncTaskStatusFromStories } from "@/lib/sync-task-status-from-stories"

/**
 * POST /api/admin/sync-task-status-from-stories
 * For each task in the project that has storyId, set task.status (and completedAt) from the linked story.
 * Body: { "projectId": "dolceright-mobile-app" }.
 * Use this in production so the board columns match current milestone statuses without running the script.
 */
export async function POST(request: NextRequest) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  try {
    const body = (await request.json().catch(() => ({}))) as { projectId?: string }
    const projectId = typeof body.projectId === "string" ? body.projectId.trim() : null
    if (!projectId) {
      return NextResponse.json({ error: "projectId required" }, { status: 400 })
    }

    const { db } = getFirebaseAdmin()
    const result = await syncTaskStatusFromStories(db, projectId)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("[sync-task-status-from-stories]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 },
    )
  }
}
