import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { appendHistory } from "@/lib/task-utils"
import type { TaskArtifact, ArtifactType } from "@/lib/types/task"

interface RouteContext {
  params: Promise<{ taskId: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { taskId } = await context.params
  const body = await request.json()
  const { type, url, label, actor, content } = body as {
    type: ArtifactType
    url: string
    label?: string
    actor?: string
    content?: string
  }

  if (!type || !url) {
    return NextResponse.json(
      { error: "type and url are required" },
      { status: 400 },
    )
  }

  const { db } = getFirebaseAdmin()
  const ref = db.collection("tasks").doc(taskId)
  const doc = await ref.get()
  if (!doc.exists)
    return NextResponse.json({ error: "Task not found" }, { status: 404 })

  const now = new Date().toISOString()
  const artifact: TaskArtifact = {
    type,
    url,
    label,
    addedAt: now,
    addedBy: actor ?? "admin",
    ...(content ? { content } : {}),
  }

  const existing: TaskArtifact[] = doc.data()!.artifacts ?? []
  await ref.update({
    artifacts: [...existing, artifact],
    updatedAt: now,
  })

  await appendHistory(taskId, {
    actor: actor ?? "admin",
    event: "artifact_attached",
    details: { type, url, label },
  })

  return NextResponse.json({ ok: true, id: taskId })
}
