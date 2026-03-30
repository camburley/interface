/**
 * Verify DolceRight board task counts match milestone story counts by status.
 * Run: npx tsx scripts/verify-dolceright-board.ts
 */

import { readFileSync } from "fs"
import { resolve } from "path"
import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

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

const STORY_TO_TASK: Record<string, string> = {
  todo: "todo",
  "in-progress": "in_progress",
  review: "review",
  done: "done",
  blocked: "blocked",
}

async function main() {
  const milestonesSnap = await db
    .collection("milestones")
    .where("projectId", "==", PROJECT_ID)
    .get()
  const milestoneIds = milestonesSnap.docs.map((d) => d.id)

  const storyCounts: Record<string, number> = {}
  for (const mid of milestoneIds) {
    const snap = await db.collection("stories").where("milestoneId", "==", mid).get()
    for (const d of snap.docs) {
      const status = (d.data().status as string) ?? "todo"
      const taskStatus = STORY_TO_TASK[status] ?? "todo"
      storyCounts[taskStatus] = (storyCounts[taskStatus] ?? 0) + 1
    }
  }

  const tasksSnap = await db.collection("tasks").where("projectId", "==", PROJECT_ID).get()
  const taskCounts: Record<string, number> = {}
  let withStoryId = 0
  for (const d of tasksSnap.docs) {
    const status = d.data().status as string
    taskCounts[status] = (taskCounts[status] ?? 0) + 1
    if (d.data().storyId) withStoryId++
  }

  console.log("DolceRight milestone stories by status (mapped to task status):")
  Object.entries(storyCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([status, n]) => console.log(`  ${status}: ${n}`))
  console.log("  total stories:", Object.values(storyCounts).reduce((a, b) => a + b, 0))

  console.log("\nDolceRight board tasks by status:")
  Object.entries(taskCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([status, n]) => console.log(`  ${status}: ${n}`))
  console.log("  total tasks:", tasksSnap.size)
  console.log("  tasks with storyId:", withStoryId)

  const todoMatch = (storyCounts["todo"] ?? 0) === (taskCounts["todo"] ?? 0)
  const progressMatch =
    (storyCounts["in_progress"] ?? 0) === (taskCounts["in_progress"] ?? 0)
  console.log(
    "\nMatch:",
    todoMatch && progressMatch
      ? "YES — board TODO and IN_PROGRESS match milestone"
      : `NO — todo match: ${todoMatch}, in_progress match: ${progressMatch}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
