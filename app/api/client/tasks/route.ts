import { NextRequest, NextResponse } from "next/server"
import { validateClientSession } from "@/lib/client-auth"
import { getSessionUser, isAdmin } from "@/lib/session"
import { fetchTasksFromFirestore, generateTaskId, buildNewTask, appendHistory } from "@/lib/task-utils"

async function getAuthorizedSession(): Promise<{
  uid: string
  projectId?: string
  actorLabel: string
} | null> {
  const clientSession = await validateClientSession()
  if (clientSession) {
    return {
      uid: clientSession.uid,
      projectId: clientSession.projectId,
      actorLabel: `client:${clientSession.clientName || clientSession.email || clientSession.uid}`,
    }
  }

  const user = await getSessionUser()
  if (user && isAdmin(user.uid)) {
    return { uid: user.uid, actorLabel: `admin:${user.email || user.uid}` }
  }

  return null
}

export async function GET() {
  const session = await getAuthorizedSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  if (!session.projectId)
    return NextResponse.json({ error: "No project context" }, { status: 400 })

  const tasks = await fetchTasksFromFirestore({ projectId: session.projectId })
  tasks.sort((a, b) => (a.position ?? 99999) - (b.position ?? 99999))

  return NextResponse.json({ tasks })
}

export async function POST(request: NextRequest) {
  const session = await getAuthorizedSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const body = await request.json()
  if (!body.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 })
  }

  const projectId = session.projectId || body.projectId
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 })
  }

  const { getFirebaseAdmin } = await import("@/lib/firebase-admin")
  const { db } = getFirebaseAdmin()

  const taskId = await generateTaskId()
  const taskData = buildNewTask({
    taskId,
    title: body.title,
    projectId,
    description: body.description,
    clientDescription: body.clientDescription,
    status: "todo",
    priority: body.priority ?? "medium",
    tags: body.tags,
    acceptanceCriteria: body.acceptanceCriteria,
    definitionOfDone: body.definitionOfDone,
  })

  const ref = await db.collection("tasks").add(taskData)

  await appendHistory(ref.id, {
    actor: session.actorLabel,
    event: "created",
    details: { title: taskData.title, status: "todo" },
  })

  return NextResponse.json({ ok: true, id: ref.id, taskId })
}
