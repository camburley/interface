/**
 * Verifies milestone→board sync against the Firebase in .env.
 * Run: npx tsx scripts/verify-milestone-board-sync.ts
 * Exit 0 = sync works; exit 1 = sync failed (see output and scripts/verify-sync-result.txt).
 */

import { readFileSync } from "fs"
import { resolve } from "path"
import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { storyStatusToTaskStatus } from "../lib/sync-status"

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
const RESULT_PATH = resolve(process.cwd(), "scripts/verify-sync-result.txt")

function writeResult(msg: string, ok: boolean) {
  const { writeFileSync } = require("fs")
  writeFileSync(RESULT_PATH, msg, "utf8")
  console.log(msg)
  process.exit(ok ? 0 : 1)
}

async function main() {
  // 1) Find a story that has a linked task (or can be found by fallback)
  const milestonesSnap = await db.collection("milestones").where("projectId", "==", PROJECT_ID).get()
  if (milestonesSnap.empty) {
    writeResult("FAIL: No milestones for project " + PROJECT_ID, false)
    return
  }

  let storyId: string | null = null
  let storyRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> | null = null
  let storyData: Record<string, unknown> | null = null
  let milestoneId: string | null = null

  for (const mDoc of milestonesSnap.docs) {
    const storiesSnap = await db.collection("stories").where("milestoneId", "==", mDoc.id).get()
    for (const sDoc of storiesSnap.docs) {
      const tasksWithStory = await db.collection("tasks").where("storyId", "==", sDoc.id).get()
      if (!tasksWithStory.empty) {
        storyId = sDoc.id
        storyRef = sDoc.ref
        storyData = sDoc.data()
        milestoneId = mDoc.id
        break
      }
    }
    if (storyId) break
  }

  if (!storyId || !storyRef || !storyData || !milestoneId) {
    writeResult("FAIL: No story with linked task (storyId set) found for " + PROJECT_ID, false)
    return
  }

  const taskSnap = await db.collection("tasks").where("storyId", "==", storyId).get()
  const taskDoc = taskSnap.docs[0]
  const taskId = taskDoc.id
  const taskBefore = taskDoc.data()
  const storyTitle = (storyData.title as string) ?? ""

  // 2) Update story to in-progress
  await storyRef.update({ status: "in-progress", completedAt: null })

  // 3) Run same sync as PATCH route
  const taskStatus = storyStatusToTaskStatus("in-progress")
  const now = new Date().toISOString()
  const tasksSnap = await db.collection("tasks").where("storyId", "==", storyId).get()
  if (tasksSnap.empty) {
    const titleNorm = storyTitle.trim().toLowerCase()
    const byMilestone = await db.collection("tasks").where("milestoneId", "==", milestoneId).get()
    const match = byMilestone.docs.find(
      (d) => (d.data().title as string)?.trim().toLowerCase() === titleNorm,
    )
    if (match) {
      await match.ref.update({
        storyId,
        status: taskStatus,
        updatedAt: now,
        completedAt: null,
      })
    } else {
      writeResult(
        "FAIL: Fallback could not find task by milestoneId+title. titleNorm=" + titleNorm + " taskTitles=" + JSON.stringify(byMilestone.docs.map((d) => (d.data().title as string)?.slice(0, 40))),
        false,
      )
      return
    }
  } else {
    for (const t of tasksSnap.docs) {
      await t.ref.update({
        status: taskStatus,
        updatedAt: now,
        completedAt: null,
      })
    }
  }

  // 4) Re-read task
  const taskAfterSnap = await db.collection("tasks").doc(taskId).get()
  const taskAfter = taskAfterSnap.data()
  const statusAfter = taskAfter?.status

  if (statusAfter !== "in_progress") {
    writeResult(
      "FAIL: Task " + taskId + " status after sync: " + statusAfter + " (expected in_progress). Before: " + taskBefore.status,
      false,
    )
    return
  }

  // 5) Board view: tasks with projectId + in_progress (same query as board filter)
  const boardViewSnap = await db
    .collection("tasks")
    .where("projectId", "==", PROJECT_ID)
    .where("status", "==", "in_progress")
    .get()
  const inProgressCount = boardViewSnap.size
  const ourTaskInList = boardViewSnap.docs.some((d) => d.id === taskId)
  if (!ourTaskInList || inProgressCount < 1) {
    writeResult(
      "FAIL: Board query (projectId=" + PROJECT_ID + ", status=in_progress) returned " + inProgressCount + " tasks; our task in list=" + ourTaskInList + ". Task projectId=" + (taskAfter?.projectId ?? "?") + ".",
      false,
    )
    return
  }

  writeResult(
    "OK: storyId=" + storyId + " taskId=" + taskId + " status before=" + taskBefore.status + " after=" + statusAfter + " | board in_progress count=" + inProgressCount,
    true,
  )
}

main().catch((err) => {
  writeResult("FAIL: " + String(err), false)
})
