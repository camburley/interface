import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import type { BoardType } from "@/lib/types/milestone"

const VALID_BOARD_TYPES: BoardType[] = ["client", "internal", "ops"]

interface RouteContext {
  params: Promise<{ projectId: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { projectId } = await context.params
  const { db } = getFirebaseAdmin()

  const doc = await db.collection("milestone_projects").doc(projectId).get()
  if (!doc.exists)
    return NextResponse.json({ error: "Project not found" }, { status: 404 })

  return NextResponse.json({ project: { id: doc.id, ...doc.data() } })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { projectId } = await context.params
  const body = await request.json()
  const { db } = getFirebaseAdmin()

  const ref = db.collection("milestone_projects").doc(projectId)
  const doc = await ref.get()
  if (!doc.exists)
    return NextResponse.json({ error: "Project not found" }, { status: 404 })

  const allowed = ["clientName", "projectName", "boardType", "archived"]
  const updates: Record<string, unknown> = {}

  for (const key of allowed) {
    if (body[key] !== undefined) {
      if (key === "boardType" && !VALID_BOARD_TYPES.includes(body[key])) {
        return NextResponse.json(
          { error: `boardType must be one of: ${VALID_BOARD_TYPES.join(", ")}` },
          { status: 400 },
        )
      }
      updates[key] = body[key]
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    )
  }

  updates.updatedAt = new Date().toISOString()
  await ref.update(updates)

  return NextResponse.json({ ok: true, id: projectId, updates })
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { projectId } = await context.params
  const { db } = getFirebaseAdmin()

  const ref = db.collection("milestone_projects").doc(projectId)
  const doc = await ref.get()
  if (!doc.exists)
    return NextResponse.json({ error: "Project not found" }, { status: 404 })

  const cascade = request.nextUrl.searchParams.get("cascade") === "true"

  if (cascade) {
    const batch = db.batch()

    const milestones = await db
      .collection("milestones")
      .where("projectId", "==", projectId)
      .get()

    for (const ms of milestones.docs) {
      const stories = await db
        .collection("stories")
        .where("milestoneId", "==", ms.id)
        .get()
      stories.docs.forEach((s) => batch.delete(s.ref))
      batch.delete(ms.ref)
    }

    const tasks = await db
      .collection("tasks")
      .where("projectId", "==", projectId)
      .get()
    for (const t of tasks.docs) {
      const history = await t.ref.collection("history").get()
      history.docs.forEach((h) => batch.delete(h.ref))
      batch.delete(t.ref)
    }

    batch.delete(ref)
    await batch.commit()

    return NextResponse.json({
      ok: true,
      id: projectId,
      cascaded: {
        milestones: milestones.size,
        tasks: tasks.size,
      },
    })
  }

  await ref.delete()
  return NextResponse.json({ ok: true, id: projectId })
}
