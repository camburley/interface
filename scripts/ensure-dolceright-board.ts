/**
 * Ensure every DolceRight story has a board task, then sync task status from stories.
 * Uses .env Firebase. Run: npx tsx scripts/ensure-dolceright-board.ts
 */

import { readFileSync } from "fs"
import { resolve } from "path"
import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { buildNewTask } from "../lib/task-utils"
import { storyStatusToTaskStatus } from "../lib/sync-status"
import { syncTaskStatusFromStories } from "../lib/sync-task-status-from-stories"
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
const COUNTER_REF = db.collection("counters").doc("task_id_counter")

async function getNextTaskId(): Promise<string> {
  const result = await db.runTransaction(async (tx) => {
    const doc = await tx.get(COUNTER_REF)
    const current = doc.exists ? (doc.data()!.value as number) : 0
    const next = current + 1
    tx.set(COUNTER_REF, { value: next })
    return next
  })
  return `TASK-${String(result).padStart(3, "0")}`
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

  const tasksSnap = await db.collection("tasks").where("projectId", "==", PROJECT_ID).get()
  const linkedStoryIds = new Set(
    tasksSnap.docs.map((d) => d.data().storyId).filter(Boolean) as string[],
  )

  let created = 0
  for (const story of stories) {
    if (linkedStoryIds.has(story.id)) continue
    const taskId = await getNextTaskId()
    const taskData = buildNewTask({
      taskId,
      title: story.title,
      projectId: PROJECT_ID,
      milestoneId: story.milestoneId,
      storyId: story.id,
      status: storyStatusToTaskStatus(story.status),
    })
    const ref = await db.collection("tasks").add(taskData)
    await ref.collection("history").add({
      timestamp: new Date().toISOString(),
      actor: "ensure-dolceright-board",
      event: "created",
      details: { storyId: story.id, title: taskData.title },
    })
    linkedStoryIds.add(story.id)
    created++
    console.log(`  Created task ${taskId} for story: ${story.title.slice(0, 50)}...`)
  }

  console.log(`\nCreated ${created} tasks for stories that had none.`)

  const { synced } = await syncTaskStatusFromStories(db, PROJECT_ID)
  console.log(`Synced status from story → task for ${synced} tasks. Board now matches milestone.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
