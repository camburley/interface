/**
 * Link every DolceRight milestone story to a board task by setting task.storyId.
 * For each story we find the best-matching task (by title) and set task.storyId = story.id.
 *
 * Run with: npx tsx scripts/link-dolceright-tasks-to-stories.ts
 * Uses .env for Firebase (same as app). Run with production .env to fix production board.
 */

import { readFileSync } from "fs"
import { resolve } from "path"
import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { storyStatusToTaskStatus } from "../lib/sync-status"
import type { StoryStatus } from "../lib/types/milestone"

const envPath = resolve(process.cwd(), ".env")
try {
  const envContent = readFileSync(envPath, "utf8")
  for (const line of envContent.split("\n")) {
    if (!line || line.startsWith("#")) continue
    const eqIdx = line.indexOf("=")
    if (eqIdx === -1) continue
    const key = line.slice(0, eqIdx).trim()
    const val = line.slice(eqIdx + 1).trim().replace(/^"|"$/g, "")
    if (!process.env[key]) process.env[key] = val
  }
} catch {}

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
  console.error("Missing Firebase credentials in .env")
  process.exit(1)
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
})

const db = getFirestore(app)

const PROJECT_ID = "dolceright-mobile-app"

function norm(t: string): string {
  return (t ?? "").trim().toLowerCase()
}

function scoreMatch(storyTitleNorm: string, taskTitleNorm: string): number {
  if (storyTitleNorm === taskTitleNorm) return 3
  if (storyTitleNorm.length > 10 && taskTitleNorm.length > 10) {
    if (taskTitleNorm.includes(storyTitleNorm) || storyTitleNorm.includes(taskTitleNorm)) return 2
    const minLen = Math.min(20, storyTitleNorm.length, taskTitleNorm.length)
    if (minLen >= 10 && storyTitleNorm.slice(0, minLen) === taskTitleNorm.slice(0, minLen)) return 1
  }
  return 0
}

async function main() {
  const milestonesSnap = await db
    .collection("milestones")
    .where("projectId", "==", PROJECT_ID)
    .get()

  const milestoneIds = milestonesSnap.docs.map((d) => d.id)
  if (milestoneIds.length === 0) {
    console.log("No milestones for project", PROJECT_ID)
    return
  }

  const stories: { id: string; title: string; milestoneId: string }[] = []
  for (const mid of milestoneIds) {
    const storiesSnap = await db.collection("stories").where("milestoneId", "==", mid).get()
    for (const d of storiesSnap.docs) {
      const data = d.data()
      stories.push({
        id: d.id,
        title: (data.title as string) ?? "",
        milestoneId: mid,
      })
    }
  }

  const tasksSnap = await db.collection("tasks").where("projectId", "==", PROJECT_ID).get()
  const tasks = tasksSnap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      title: (data.title as string) ?? "",
      storyId: data.storyId as string | undefined,
    }
  })

  console.log(`DolceRight: ${stories.length} stories, ${tasks.length} tasks\n`)

  const usedTaskIds = new Set<string>()
  const linkedStoryIds = new Set<string>()
  let updated = 0

  for (const story of stories) {
    const storyNorm = norm(story.title)
    if (!storyNorm) continue

    let best: { taskId: string; score: number } | null = null
    for (const task of tasks) {
      if (usedTaskIds.has(task.id)) continue
      const taskNorm = norm(task.title)
      const score = scoreMatch(storyNorm, taskNorm)
      if (score > 0 && (best === null || score > best.score)) {
        best = { taskId: task.id, score }
      }
    }

    if (best) {
      const taskRef = db.collection("tasks").doc(best.taskId)
      await taskRef.update({
        storyId: story.id,
        updatedAt: new Date().toISOString(),
      })
      usedTaskIds.add(best.taskId)
      linkedStoryIds.add(story.id)
      updated++
      const task = tasks.find((t) => t.id === best!.taskId)!
      console.log(`  [${task.id}] storyId = ${story.id}  (story: "${story.title.slice(0, 50)}...")`)
    } else {
      console.log(`  (no match) story "${story.title.slice(0, 50)}..." [${story.id}]`)
    }
  }

  const unmatchedStories = stories.filter((s) => !linkedStoryIds.has(s.id))
  const unusedTasks = tasks.filter((t) => !usedTaskIds.has(t.id))

  if (unmatchedStories.length > 0 && unusedTasks.length > 0) {
    console.log(`\nSecond pass: loose match ${unmatchedStories.length} stories to ${unusedTasks.length} remaining tasks`)
    for (const story of unmatchedStories) {
      const storyNorm = norm(story.title)
      const storyWords = storyNorm.split(/\s+/).filter((w) => w.length > 3)
      let bestTask: typeof tasks[0] | null = null
      let bestScore = 0
      for (const task of tasks) {
        if (usedTaskIds.has(task.id)) continue
        const taskNorm = norm(task.title)
        const taskWords = new Set(taskNorm.split(/\s+/).filter((w) => w.length > 3))
        const overlap = storyWords.filter((w) => taskWords.has(w) || taskNorm.includes(w) || storyNorm.includes(w)).length
        const score = overlap + (storyNorm.slice(0, 15) === taskNorm.slice(0, 15) ? 5 : 0)
        if (score > bestScore && score >= 2) {
          bestScore = score
          bestTask = task
        }
      }
      if (bestTask) {
        await db.collection("tasks").doc(bestTask.id).update({
          storyId: story.id,
          updatedAt: new Date().toISOString(),
        })
        usedTaskIds.add(bestTask.id)
        updated++
        console.log(`  [${bestTask.id}] storyId = ${story.id}  (loose: "${story.title.slice(0, 40)}...")`)
      }
    }
  }

  console.log(`\nDone: ${updated} tasks linked to DolceRight stories.`)

  // Sync status from each story to its linked task so board columns match milestone
  const allProjectTasksSnap = await db
    .collection("tasks")
    .where("projectId", "==", PROJECT_ID)
    .get()
  const linkedTasksSnap = { docs: allProjectTasksSnap.docs.filter((d) => d.data().storyId) }

  let statusSynced = 0
  for (const taskDoc of linkedTasksSnap.docs) {
    const taskData = taskDoc.data()
    const storyId = taskData.storyId as string
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
    statusSynced++
  }
  console.log(`Synced status from story → task for ${statusSynced} tasks. Board columns now match milestone.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
