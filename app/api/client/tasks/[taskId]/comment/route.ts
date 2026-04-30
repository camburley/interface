import { NextRequest, NextResponse } from "next/server"
import { validateClientSession } from "@/lib/client-auth"
import { getSessionUser, isAdmin } from "@/lib/session"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { appendHistory } from "@/lib/task-utils"

interface RouteContext {
  params: Promise<{ taskId: string }>
}

async function getCommentSession(): Promise<{ actor: string; projectId?: string } | null> {
  const clientSession = await validateClientSession()
  if (clientSession) {
    return {
      actor: `client:${clientSession.clientName || clientSession.email || clientSession.uid}`,
      projectId: clientSession.projectId,
    }
  }

  const user = await getSessionUser()
  if (user && isAdmin(user.uid)) {
    return { actor: `admin:${user.email || user.uid}` }
  }

  return null
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await getCommentSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { taskId } = await context.params
  const body = await request.json()
  const { content } = body as { content: string }

  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 })
  }

  const { db } = getFirebaseAdmin()
  const ref = db.collection("tasks").doc(taskId)
  const doc = await ref.get()
  if (!doc.exists)
    return NextResponse.json({ error: "Task not found" }, { status: 404 })

  const task = doc.data()!
  if (session.projectId && task.projectId !== session.projectId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (task.status !== "review") {
    return NextResponse.json(
      { error: "Comments can only be added to tasks in Review" },
      { status: 400 },
    )
  }

  await ref.update({ updatedAt: new Date().toISOString() })

  await appendHistory(taskId, {
    actor: session.actor,
    event: "comment",
    details: { content },
  })

  return NextResponse.json({ ok: true, id: taskId })
}
