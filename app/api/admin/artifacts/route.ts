import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import type { Task, TaskArtifact } from "@/lib/types/task"

export interface ArtifactWithContext extends TaskArtifact {
  taskId: string
  taskDocId: string
  taskTitle: string
  assignee?: string
  projectId: string
  taskStatus: string
}

export async function GET(request: NextRequest) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const params = request.nextUrl.searchParams
  const filterAssignee = params.get("assignee")
  const filterType = params.get("type")
  const filterProjectId = params.get("projectId")
  const filterSince = params.get("since")

  const { db } = getFirebaseAdmin()
  const snap = await db.collection("tasks").get()

  const artifacts: ArtifactWithContext[] = []

  for (const doc of snap.docs) {
    const task = { id: doc.id, ...doc.data() } as Task
    if (!task.artifacts || task.artifacts.length === 0) continue

    // Apply task-level filters
    if (filterAssignee && task.assignee !== filterAssignee) continue
    if (filterProjectId && task.projectId !== filterProjectId) continue

    for (const artifact of task.artifacts) {
      // Apply artifact-level filters
      if (filterType && artifact.type !== filterType) continue
      if (filterSince && artifact.addedAt < filterSince) continue

      artifacts.push({
        ...artifact,
        taskDocId: doc.id,
        taskId: task.taskId,
        taskTitle: task.title,
        assignee: task.assignee,
        projectId: task.projectId,
        taskStatus: task.status,
      })
    }
  }

  // Sort newest first
  artifacts.sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
  )

  return NextResponse.json({ artifacts, total: artifacts.length })
}
