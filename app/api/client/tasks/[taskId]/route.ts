import { NextRequest, NextResponse } from "next/server"
import { validateClientSession } from "@/lib/client-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"

interface RouteContext {
  params: Promise<{ taskId: string }>
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
