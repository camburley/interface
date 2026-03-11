import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { appendHistory } from "@/lib/task-utils"

interface RouteContext {
  params: Promise<{ taskId: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { taskId } = await context.params
  const body = await request.json()
  const { actor, confidence } = body as {
    actor: string
    confidence?: number
  }

  if (!actor) {
    return NextResponse.json(
      { error: "actor is required" },
      { status: 400 },
    )
  }

  const { db } = getFirebaseAdmin()
  const ref = db.collection("tasks").doc(taskId)
  const doc = await ref.get()
  if (!doc.exists)
    return NextResponse.json({ error: "Task not found" }, { status: 404 })

  await ref.update({
    assignee: actor,
    updatedAt: new Date().toISOString(),
  })

  await appendHistory(taskId, {
    actor,
    event: "claimed",
    confidence,
    details: { previousAssignee: doc.data()!.assignee ?? null },
  })

  return NextResponse.json({ ok: true, id: taskId, assignee: actor })
}
