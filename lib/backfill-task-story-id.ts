/**
 * Backfill task.storyId so milestone–board sync can find tasks.
 * Used by scripts/backfill-task-story-id.ts and POST /api/admin/backfill-task-story-id.
 */

import type { Firestore } from "firebase-admin/firestore"

export async function backfillTaskStoryId(db: Firestore): Promise<{ updated: number; skipped: number }> {
  const tasksSnap = await db.collection("tasks").get()
  let updated = 0
  let skipped = 0

  for (const taskDoc of tasksSnap.docs) {
    const data = taskDoc.data()
    if (data.storyId) {
      skipped++
      continue
    }

    let originalStoryId: string | null = null

    const historySnap = await taskDoc.ref.collection("history").orderBy("timestamp", "asc").get()
    for (const h of historySnap.docs) {
      const details = h.data().details as { originalStoryId?: string } | undefined
      if (details?.originalStoryId) {
        originalStoryId = details.originalStoryId
        break
      }
    }

    if (!originalStoryId && data.milestoneId && data.title) {
      const storiesSnap = await db.collection("stories").where("milestoneId", "==", data.milestoneId).get()
      const taskTitleNorm = String(data.title).trim().toLowerCase()
      const match = storiesSnap.docs.find((d) => {
        const t = (d.data().title as string)?.trim().toLowerCase() ?? ""
        return t === taskTitleNorm || (taskTitleNorm.length > 10 && (taskTitleNorm.includes(t) || t.includes(taskTitleNorm)))
      })
      if (match) originalStoryId = match.id
    }

    if (!originalStoryId && data.projectId && data.title) {
      const storiesSnap = await db.collection("stories").where("projectId", "==", data.projectId).get()
      const taskTitleNorm = String(data.title).trim().toLowerCase()
      const match = storiesSnap.docs.find((d) => {
        const t = (d.data().title as string)?.trim().toLowerCase() ?? ""
        return t === taskTitleNorm || (taskTitleNorm.length > 10 && (taskTitleNorm.includes(t) || t.includes(taskTitleNorm)))
      })
      if (match) originalStoryId = match.id
    }

    if (!originalStoryId) {
      skipped++
      continue
    }

    await taskDoc.ref.update({ storyId: originalStoryId })
    updated++
  }

  return { updated, skipped }
}
