/**
 * Migration script: converts existing stories into the canonical tasks collection.
 *
 * Run with:
 *   npx tsx scripts/migrate-stories-to-tasks.ts
 *
 * Requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * in .env (or already loaded via dotenv).
 *
 * Safe to run multiple times -- skips stories already migrated (checks by title + milestoneId).
 */

import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

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

const STORY_STATUS_TO_TASK_STATUS: Record<string, string> = {
  todo: "todo",
  "in-progress": "in_progress",
  review: "review",
  done: "done",
  blocked: "blocked",
}

async function getNextCounter(): Promise<number> {
  const ref = db.collection("counters").doc("task_id_counter")
  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref)
    const current = doc.exists ? (doc.data()!.value as number) : 0
    const next = current + 1
    tx.set(ref, { value: next })
    return next
  })
}

async function migrate() {
  console.log("Starting stories -> tasks migration...\n")

  const storiesSnap = await db.collection("stories").get()
  console.log(`Found ${storiesSnap.size} stories to migrate.`)

  let created = 0
  let skipped = 0

  for (const storyDoc of storiesSnap.docs) {
    const story = storyDoc.data()

    const existingSnap = await db
      .collection("tasks")
      .where("milestoneId", "==", story.milestoneId)
      .where("title", "==", story.title)
      .limit(1)
      .get()

    if (!existingSnap.empty) {
      skipped++
      continue
    }

    const counter = await getNextCounter()
    const taskId = `TASK-${String(counter).padStart(3, "0")}`
    const now = new Date().toISOString()

    const taskData = {
      taskId,
      title: story.title,
      description: story.notes ?? "",
      status: STORY_STATUS_TO_TASK_STATUS[story.status] ?? "backlog",
      priority: "medium",
      projectId: story.projectId,
      milestoneId: story.milestoneId,
      parentTaskId: null,
      dependencies: [],
      assignee: null,
      owner: null,
      tags: [],
      hours: null,
      acceptanceCriteria: [],
      definitionOfDone: [],
      artifacts: (story.attachments ?? []).map(
        (a: { type: string; url: string; label?: string; addedAt?: string }) => ({
          type: a.type === "loom" ? "loom" : a.type === "screenshot" ? "screenshot" : "url",
          url: a.url,
          label: a.label ?? "",
          addedAt: a.addedAt ?? now,
        }),
      ),
      context: {},
      specUrl: story.specUrl ?? null,
      outputUrl: story.outputUrl ?? null,
      dueDate: null,
      sprint: null,
      createdAt: story.createdAt ?? now,
      updatedAt: now,
      completedAt: story.completedAt ?? null,
    }

    const ref = await db.collection("tasks").add(taskData)

    await ref.collection("history").add({
      timestamp: now,
      actor: "migration-script",
      event: "created",
      details: {
        source: "stories",
        originalStoryId: storyDoc.id,
      },
    })

    created++
    console.log(`  [${taskId}] ${story.title} (${taskData.status})`)
  }

  console.log(`\nMigration complete: ${created} created, ${skipped} skipped (already exist).`)
}

migrate().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
