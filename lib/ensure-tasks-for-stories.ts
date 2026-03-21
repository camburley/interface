/**
 * Create a board task for every milestone story that doesn't have one (storyId link).
 * Then sync task status from stories so board columns match milestone.
 * Used by POST /api/admin/ensure-tasks-for-stories.
 */

import type { Firestore } from "firebase-admin/firestore"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { generateTaskId, buildNewTask, appendHistory } from "@/lib/task-utils"
import { storyStatusToTaskStatus } from "@/lib/sync-status"
import { syncTaskStatusFromStories } from "@/lib/sync-task-status-from-stories"
import type { StoryStatus } from "@/lib/types/milestone"

export async function ensureTasksForStories(
  db: Firestore,
  projectId: string,
): Promise<{ created: number; synced: number }> {
  const milestonesSnap = await db
    .collection("milestones")
    .where("projectId", "==", projectId)
    .get()
  const milestoneIds = milestonesSnap.docs.map((d) => d.id)
  if (milestoneIds.length === 0) return { created: 0, synced: 0 }

  const stories: { id: string; title: string; milestoneId: string; status: StoryStatus }[] = []
  for (const mid of milestoneIds) {
    const storiesSnap = await db.collection("stories").where("milestoneId", "==", mid).get()
    for (const d of storiesSnap.docs) {
      const data = d.data()
      stories.push({
        id: d.id,
        title: (data.title as string) ?? "",
        milestoneId: mid,
        status: (data.status as StoryStatus) ?? "todo",
      })
    }
  }

  const tasksSnap = await db.collection("tasks").where("projectId", "==", projectId).get()
  const linkedStoryIds = new Set(
    tasksSnap.docs.map((d) => d.data().storyId).filter(Boolean) as string[],
  )

  let created = 0
  for (const story of stories) {
    if (linkedStoryIds.has(story.id)) continue
    const taskId = await generateTaskId()
    const taskData = buildNewTask({
      taskId,
      title: story.title,
      projectId,
      milestoneId: story.milestoneId,
      storyId: story.id,
      status: storyStatusToTaskStatus(story.status),
    })
    const ref = await db.collection("tasks").add(taskData)
    await appendHistory(ref.id, {
      actor: "ensure-tasks-for-stories",
      event: "created",
      details: { storyId: story.id, title: taskData.title },
    })
    linkedStoryIds.add(story.id)
    created++
  }

  const { synced } = await syncTaskStatusFromStories(db, projectId)
  return { created, synced }
}
