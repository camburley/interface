import { NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { storyStatusToTaskStatus } from "@/lib/sync-status"
import type { StoryAttachment } from "@/lib/types/milestone"

interface RouteContext {
  params: Promise<{ milestoneId: string; storyId: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { storyId } = await context.params
  const body = await request.json()
  const { db } = getFirebaseAdmin()

  const ref = db.collection("stories").doc(storyId)
  const doc = await ref.get()
  if (!doc.exists) return NextResponse.json({ error: "Story not found" }, { status: 404 })

  const updates: Record<string, unknown> = {}

  if (body.status !== undefined) {
    const valid = ["todo", "in-progress", "review", "done", "blocked"]
    if (!valid.includes(body.status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${valid.join(", ")}` }, { status: 400 })
    }
    updates.status = body.status
    if (body.status === "done") {
      updates.completedAt = new Date().toISOString()
    } else {
      updates.completedAt = null
    }
  }

  if (body.title !== undefined) updates.title = body.title
  if (body.kind !== undefined) updates.kind = body.kind
  if (body.placeholder !== undefined) updates.placeholder = Boolean(body.placeholder)
  if (body.notes !== undefined) updates.notes = body.notes
  if (body.outputUrl !== undefined) updates.outputUrl = body.outputUrl
  if (body.specUrl !== undefined) updates.specUrl = body.specUrl

  if (body.attachments !== undefined) {
    const existing: StoryAttachment[] = doc.data()!.attachments ?? []
    const incoming: StoryAttachment[] = Array.isArray(body.attachments) ? body.attachments : []
    const merged = [
      ...existing,
      ...incoming.map((a: StoryAttachment) => ({
        type: a.type,
        url: a.url,
        label: a.label ?? "",
        addedAt: a.addedAt ?? new Date().toISOString(),
      })),
    ]
    updates.attachments = merged
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  await ref.update(updates)

  if (body.status !== undefined) {
    const taskStatus = storyStatusToTaskStatus(body.status as Parameters<typeof storyStatusToTaskStatus>[0])
    const tasksSnap = await db.collection("tasks").where("storyId", "==", storyId).get()
    const now = new Date().toISOString()
    for (const taskDoc of tasksSnap.docs) {
      const taskUpdates: Record<string, unknown> = {
        status: taskStatus,
        updatedAt: now,
        completedAt: taskStatus === "done" ? now : null,
      }
      await taskDoc.ref.update(taskUpdates)
    }
  }

  return NextResponse.json({ ok: true, id: storyId })
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { storyId } = await context.params
  const { db } = getFirebaseAdmin()

  const ref = db.collection("stories").doc(storyId)
  const doc = await ref.get()
  if (!doc.exists) return NextResponse.json({ error: "Story not found" }, { status: 404 })

  await ref.delete()
  return NextResponse.json({ ok: true })
}
