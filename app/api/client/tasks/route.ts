import { NextRequest, NextResponse } from "next/server"
import { validateClientSession } from "@/lib/client-auth"
import { fetchTasksFromFirestore, generateTaskId, buildNewTask, appendHistory } from "@/lib/task-utils"

export async function GET() {
  const session = await validateClientSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const tasks = await fetchTasksFromFirestore({ projectId: session.projectId })
  tasks.sort((a, b) => (a.position ?? 99999) - (b.position ?? 99999))

  return NextResponse.json({ tasks })
}

export async function POST(request: NextRequest) {
  const session = await validateClientSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const body = await request.json()
  if (!body.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 })
  }

  const { getFirebaseAdmin } = await import("@/lib/firebase-admin")
  const { db } = getFirebaseAdmin()

  const taskId = await generateTaskId()
  const taskData = buildNewTask({
    taskId,
    title: body.title,
    projectId: session.projectId,
    description: body.description,
    status: "todo",
    priority: body.priority ?? "medium",
    tags: body.tags,
  })

  const ref = await db.collection("tasks").add(taskData)

  await appendHistory(ref.id, {
    actor: `client:${session.clientName || session.email || session.uid}`,
    event: "created",
    details: { title: taskData.title, status: "todo" },
  })

  return NextResponse.json({ ok: true, id: ref.id, taskId })
}
