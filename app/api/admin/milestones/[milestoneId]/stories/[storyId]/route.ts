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
    try {
      const taskStatus = storyStatusToTaskStatus(body.status as Parameters<typeof storyStatusToTaskStatus>[0])
      const now = new Date().toISOString()
      let tasksSnap = await db.collection("tasks").where("storyId", "==", storyId).get()
      if (tasksSnap.empty) {
        const storyData = doc.data()!
        let milestoneId = storyData.milestoneId as string | undefined
        let projectId = storyData.projectId as string | undefined
        if (!projectId && milestoneId) {
          const milestoneDoc = await db.collection("milestones").doc(milestoneId).get()
          if (milestoneDoc.exists) projectId = milestoneDoc.data()?.projectId as string | undefined
        }
        const title = storyData.title as string | undefined
        const titleNorm = title ? (title as string).trim().toLowerCase() : ""

        const findMatch = (docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]) => {
          let m = docs.find((d) => (d.data().title as string)?.trim().toLowerCase() === titleNorm)
          if (!m && titleNorm.length > 10) {
            m = docs.find((d) => {
              const t = (d.data().title as string)?.trim().toLowerCase() ?? ""
              if (t.length < 10) return false
              if (titleNorm.includes(t) || t.includes(titleNorm)) return true
              const minLen = Math.min(20, titleNorm.length, t.length)
              return minLen >= 10 && titleNorm.slice(0, minLen) === t.slice(0, minLen)
            })
          }
          return m ?? null
        }

        let match: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> | null = null
        if (milestoneId && titleNorm) {
          const byMilestone = await db.collection("tasks").where("milestoneId", "==", milestoneId).get()
          match = findMatch(byMilestone.docs)
        }
        if (!match && projectId && titleNorm) {
          const byProject = await db.collection("tasks").where("projectId", "==", projectId).get()
          match = findMatch(byProject.docs)
        }

        if (match) {
          console.info("[milestone-story-sync] fallback matched task", {
            storyId,
            taskId: match.id,
            status: taskStatus,
          })
          await match.ref.update({
            storyId,
            status: taskStatus,
            updatedAt: now,
            completedAt: taskStatus === "done" ? now : null,
          })
        } else {
          console.warn("[milestone-story-sync] fallback: no task with matching title", {
            storyId,
            milestoneId,
            projectId,
            titleNorm,
          })
        }
      } else {
        for (const taskDoc of tasksSnap.docs) {
          const taskUpdates: Record<string, unknown> = {
            status: taskStatus,
            updatedAt: now,
            completedAt: taskStatus === "done" ? now : null,
          }
          await taskDoc.ref.update(taskUpdates)
        }
      }
    } catch (err) {
      console.error("[milestone-story-sync] task dual-write failed:", err)
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
