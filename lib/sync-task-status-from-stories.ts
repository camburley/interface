/**
 * Sync task status (and completedAt) from linked stories so board columns match milestone.
 * Used by POST /api/admin/sync-task-status-from-stories and scripts/link-dolceright-tasks-to-stories.
 */

import type { Firestore } from "firebase-admin/firestore"
import { storyStatusToTaskStatus } from "@/lib/sync-status"
import type { StoryStatus } from "@/lib/types/milestone"

export async function syncTaskStatusFromStories(
  db: Firestore,
  projectId: string,
): Promise<{ synced: number }> {
  const tasksSnap = await db.collection("tasks").where("projectId", "==", projectId).get()
  const linked = tasksSnap.docs.filter((d) => d.data().storyId)
  let synced = 0

  for (const taskDoc of linked) {
    const storyId = taskDoc.data().storyId as string
    const storyDoc = await db.collection("stories").doc(storyId).get()
    if (!storyDoc.exists) continue
    const storyStatus = (storyDoc.data()?.status as StoryStatus) ?? "todo"
    const taskStatus = storyStatusToTaskStatus(storyStatus)
    const now = new Date().toISOString()
    await taskDoc.ref.update({
      status: taskStatus,
      updatedAt: now,
      completedAt: storyStatus === "done" ? now : null,
    })
    synced++
  }

  return { synced }
}
