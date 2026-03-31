import { NextRequest, NextResponse } from "next/server"
import { validateClientSession } from "@/lib/client-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { fetchTaskHistory } from "@/lib/task-utils"

interface RouteContext {
  params: Promise<{ taskId: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await validateClientSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { taskId } = await context.params
  const { db } = getFirebaseAdmin()

  const doc = await db.collection("tasks").doc(taskId).get()
  if (!doc.exists)
    return NextResponse.json({ error: "Task not found" }, { status: 404 })

  const task = doc.data()!
  if (task.projectId !== session.projectId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const history = await fetchTaskHistory(taskId)

  return NextResponse.json({ history })
}
