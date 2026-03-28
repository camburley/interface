import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { appendHistory, fetchTaskHistory } from "@/lib/task-utils"

interface RouteContext {
  params: Promise<{ taskId: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { taskId } = await context.params
  const { db } = getFirebaseAdmin()

  const doc = await db.collection("tasks").doc(taskId).get()
  if (!doc.exists)
    return NextResponse.json({ error: "Task not found" }, { status: 404 })

  const history = await fetchTaskHistory(taskId)

  return NextResponse.json({
    task: { id: doc.id, ...doc.data() },
    history,
  })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { taskId } = await context.params
  const body = await request.json()
  const { db } = getFirebaseAdmin()

  const ref = db.collection("tasks").doc(taskId)
  const doc = await ref.get()
  if (!doc.exists)
    return NextResponse.json({ error: "Task not found" }, { status: 404 })

  const allowed = [
    "title",
    "description",
    "priority",
    "milestoneId",
    "parentTaskId",
    "dependencies",
    "assignee",
    "owner",
    "tags",
    "hours",
    "acceptanceCriteria",
    "definitionOfDone",
    "context",
    "specUrl",
    "outputUrl",
    "dueDate",
    "sprint",
    "cardType",
    "recurrence",
    "projectId",
    "position",
  ]

  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    )
  }

  updates.updatedAt = new Date().toISOString()
  await ref.update(updates)

  await appendHistory(taskId, {
    actor: body.actor ?? "admin",
    event: "updated",
    details: updates,
  })

  return NextResponse.json({ ok: true, id: taskId })
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { taskId } = await context.params
  const { db } = getFirebaseAdmin()

  const ref = db.collection("tasks").doc(taskId)
  const doc = await ref.get()
  if (!doc.exists)
    return NextResponse.json({ error: "Task not found" }, { status: 404 })

  const historySnap = await ref.collection("history").get()
  const batch = db.batch()
  historySnap.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(ref)
  await batch.commit()

  return NextResponse.json({ ok: true })
}
