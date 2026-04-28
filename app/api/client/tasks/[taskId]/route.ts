import { NextRequest, NextResponse } from "next/server"
import { validateClientSession } from "@/lib/client-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { appendHistory } from "@/lib/task-utils"

interface RouteContext {
  params: Promise<{ taskId: string }>
}

const CLIENT_UPDATABLE_FIELDS = [
  "title",
  "description",
  "clientDescription",
  "tags",
  "priority",
  "acceptanceCriteria",
  "definitionOfDone",
] as const

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await validateClientSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { taskId } = await context.params
  const body = await request.json()
  const { db } = getFirebaseAdmin()

  const ref = db.collection("tasks").doc(taskId)
  const doc = await ref.get()
  if (!doc.exists)
    return NextResponse.json({ error: "Task not found" }, { status: 404 })

  const task = doc.data()!
  if (task.projectId !== session.projectId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  if (task.status !== "todo")
    return NextResponse.json({ error: "Only To Do tasks can be updated" }, { status: 400 })

  const updates: Record<string, unknown> = {}
  for (const key of CLIENT_UPDATABLE_FIELDS) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })

  updates.updatedAt = new Date().toISOString()
  await ref.update(updates)

  await appendHistory(taskId, {
    actor: `client:${session.clientName || session.email || session.uid}`,
    event: "size_it_reconciled",
    details: updates,
  })

  return NextResponse.json({ ok: true, id: taskId })
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await validateClientSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { taskId } = await context.params
  const { db } = getFirebaseAdmin()

  const ref = db.collection("tasks").doc(taskId)
  const doc = await ref.get()
  if (!doc.exists)
    return NextResponse.json({ error: "Task not found" }, { status: 404 })

  const task = doc.data()!
  if (task.projectId !== session.projectId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (task.status !== "todo") {
    return NextResponse.json(
      { error: "Only To Do tasks can be deleted" },
      { status: 400 },
    )
  }

  const historySnap = await ref.collection("history").get()
  const batch = db.batch()
  historySnap.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(ref)
  await batch.commit()

  return NextResponse.json({ ok: true })
}
