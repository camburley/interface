import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { ensureTasksForStories } from "@/lib/ensure-tasks-for-stories"

/**
 * POST /api/admin/ensure-tasks-for-stories
 * For each story in the project's milestones that has no board task, create one and link storyId.
 * Then sync all task statuses from stories so board columns match milestone.
 * Body: { "projectId": "dolceright-mobile-app" }.
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
    const result = await ensureTasksForStories(db, projectId)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("[ensure-tasks-for-stories]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ensure tasks failed" },
      { status: 500 },
    )
  }
}
