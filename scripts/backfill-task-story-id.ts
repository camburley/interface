/**
 * Backfill task.storyId from task history (details.originalStoryId).
 * Run once after deploying milestone–board sync so existing tasks
 * created from stories are linked and stay in sync.
 *
 * Run with:
 *   npx tsx scripts/backfill-task-story-id.ts
 *
 * Requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * in .env (or already loaded).
 *
 * Safe to run multiple times — skips tasks that already have storyId.
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
  console.error("Missing Firebase credentials in environment")
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

async function backfill() {
  console.log("Backfilling task.storyId from history.originalStoryId...\n")

  const tasksSnap = await db.collection("tasks").get()
  let updated = 0
  let skipped = 0

  for (const taskDoc of tasksSnap.docs) {
    const data = taskDoc.data()
    if (data.storyId) {
      skipped++
      continue
    }

    const historySnap = await taskDoc.ref.collection("history").orderBy("timestamp", "asc").get()
    let originalStoryId: string | null = null
    for (const h of historySnap.docs) {
      const details = h.data().details as { originalStoryId?: string } | undefined
      if (details?.originalStoryId) {
        originalStoryId = details.originalStoryId
        break
      }
    }

    if (!originalStoryId && data.milestoneId && data.title) {
      const storiesSnap = await db
        .collection("stories")
        .where("milestoneId", "==", data.milestoneId)
        .get()
      const taskTitleNorm = String(data.title).trim().toLowerCase()
      const match = storiesSnap.docs.find((d) => {
        const t = (d.data().title as string)?.trim().toLowerCase() ?? ""
        return t === taskTitleNorm || (taskTitleNorm.length > 10 && (taskTitleNorm.includes(t) || t.includes(taskTitleNorm)))
      })
      if (match) {
        originalStoryId = match.id
      }
    }

    if (!originalStoryId) {
      skipped++
      continue
    }

    await taskDoc.ref.update({ storyId: originalStoryId })
    updated++
    console.log(`  [${taskDoc.id}] storyId = ${originalStoryId}`)
  }

  console.log(`\nBackfill complete: ${updated} updated, ${skipped} skipped.`)
}

backfill().catch((err) => {
  console.error("Backfill failed:", err)
  process.exit(1)
})
