/**
 * fix-sync-forever.ts
 * 
 * One-time script to fix all sync issues between tasks and stories:
 * 1. For tasks with title+milestoneId but no storyId: create a story and link
 * 2. For stories with no linked task: create a task and link
 * 3. Clean up orphan tasks (no title, no projectId)
 * 4. Sync statuses between linked pairs
 * 
 * Run: npx tsx scripts/fix-sync-forever.ts
 */

import { readFileSync } from "fs"
import { resolve } from "path"
import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Load env
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
  console.error("Missing Firebase credentials")
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

// Status mapping
const TASK_TO_STORY: Record<string, string> = {
  backlog: "todo",
  todo: "todo",
  in_progress: "in-progress",
  review: "review",
  qa: "review",
  done: "done",
  blocked: "blocked",
}

const STORY_TO_TASK: Record<string, string> = {
  todo: "todo",
  "in-progress": "in_progress",
  review: "review",
  done: "done",
  blocked: "blocked",
}

// Task ID counter
async function nextTaskId(): Promise<string> {
  const ref = db.collection("counters").doc("task_id_counter")
  const result = await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref)
    const current = doc.exists ? (doc.data()!.value as number) : 0
    const next = current + 1
    tx.set(ref, { value: next })
    return next
  })
  return `TASK-${String(result).padStart(3, "0")}`
}

async function main() {
  const now = new Date().toISOString()
  
  console.log("=== SYNC FIX — STARTING ===\n")
  
  // Load all tasks and stories
  const tasksSnap = await db.collection("tasks").get()
  const storiesSnap = await db.collection("stories").get()
  
  console.log(`Tasks: ${tasksSnap.size}`)
  console.log(`Stories: ${storiesSnap.size}`)
  
  // Build lookup maps
  const storyById = new Map<string, FirebaseFirestore.DocumentSnapshot>()
  const storiesByMilestoneTitle = new Map<string, string>()
  const storiesLinkedToTask = new Set<string>()
  
  for (const s of storiesSnap.docs) {
    storyById.set(s.id, s)
    const d = s.data()
    const key = `${d.milestoneId || ""}::${(d.title || "").trim().toLowerCase()}`
    storiesByMilestoneTitle.set(key, s.id)
  }
  
  // Track which stories are linked to tasks
  for (const t of tasksSnap.docs) {
    const d = t.data()
    if (d.storyId) storiesLinkedToTask.add(d.storyId)
  }
  
  // === PHASE 1: Clean orphan tasks (no title) ===
  let orphansDeleted = 0
  for (const t of tasksSnap.docs) {
    const d = t.data()
    if (!d.title && !d.projectId) {
      await t.ref.delete()
      orphansDeleted++
    }
  }
  console.log(`\nPhase 1: Deleted ${orphansDeleted} orphan tasks (no title/project)`)
  
  // === PHASE 2: For tasks with title+milestone but no storyId — create stories and link ===
  let storiesCreated = 0
  let tasksLinked = 0
  
  for (const t of tasksSnap.docs) {
    const d = t.data()
    if (d.storyId) continue  // Already linked
    if (!d.title) continue   // Orphan (cleaned above)
    if (!d.milestoneId) continue  // No milestone to link to
    
    const titleNorm = d.title.trim().toLowerCase()
    const lookupKey = `${d.milestoneId}::${titleNorm}`
    
    // Check if a story already exists with this title in this milestone
    const existingStoryId = storiesByMilestoneTitle.get(lookupKey)
    
    if (existingStoryId) {
      // Link task to existing story
      await t.ref.update({ storyId: existingStoryId })
      storiesLinkedToTask.add(existingStoryId)
      tasksLinked++
    } else {
      // Create a new story and link
      const storyData = {
        milestoneId: d.milestoneId,
        projectId: d.projectId || null,
        title: d.title,
        status: TASK_TO_STORY[d.status] || "todo",
        placeholder: false,
        notes: d.description || "",
        outputUrl: d.outputUrl || null,
        specUrl: d.specUrl || null,
        attachments: [],
        createdAt: d.createdAt || now,
        completedAt: d.status === "done" ? (d.completedAt || now) : null,
      }
      
      const storyRef = await db.collection("stories").add(storyData)
      await t.ref.update({ storyId: storyRef.id })
      
      // Update maps
      storiesByMilestoneTitle.set(lookupKey, storyRef.id)
      storiesLinkedToTask.add(storyRef.id)
      storyById.set(storyRef.id, await storyRef.get())
      storiesCreated++
      tasksLinked++
    }
  }
  
  console.log(`\nPhase 2: Created ${storiesCreated} stories for unlinked tasks`)
  console.log(`Phase 2: Linked ${tasksLinked} tasks to stories`)
  
  // === PHASE 3: For stories with no linked task — create tasks ===
  let tasksCreated = 0
  
  // Reload tasks to get updated storyId links
  const tasksSnap2 = await db.collection("tasks").get()
  const linkedStoryIds = new Set<string>()
  for (const t of tasksSnap2.docs) {
    const d = t.data()
    if (d.storyId) linkedStoryIds.add(d.storyId)
  }
  
  for (const s of storiesSnap.docs) {
    if (linkedStoryIds.has(s.id)) continue
    
    const d = s.data()
    if (!d.title || !d.projectId) continue
    
    const taskId = await nextTaskId()
    const taskData = {
      taskId,
      title: d.title,
      description: d.notes || "",
      status: STORY_TO_TASK[d.status] || "todo",
      priority: "medium",
      projectId: d.projectId,
      milestoneId: d.milestoneId || null,
      parentTaskId: null,
      dependencies: [],
      assignee: null,
      owner: null,
      tags: [],
      hours: null,
      acceptanceCriteria: [],
      definitionOfDone: [],
      artifacts: [],
      context: { repo: null, service: null, files: [], relevantDocs: [], recentDecisions: [], knownRisks: [], openQuestions: [] },
      specUrl: d.specUrl || null,
      outputUrl: d.outputUrl || null,
      dueDate: null,
      sprint: null,
      storyId: s.id,
      createdAt: d.createdAt || now,
      updatedAt: now,
      completedAt: d.status === "done" ? (d.completedAt || now) : null,
    }
    
    await db.collection("tasks").add(taskData)
    tasksCreated++
  }
  
  console.log(`\nPhase 3: Created ${tasksCreated} tasks for unlinked stories`)
  
  // === PHASE 4: Sync statuses between all linked pairs ===
  let statusSynced = 0
  const tasksSnap3 = await db.collection("tasks").get()
  
  for (const t of tasksSnap3.docs) {
    const d = t.data()
    if (!d.storyId) continue
    
    const storyDoc = await db.collection("stories").doc(d.storyId).get()
    if (!storyDoc.exists) continue
    
    const storyData = storyDoc.data()!
    const expectedStoryStatus = TASK_TO_STORY[d.status] || "todo"
    
    if (storyData.status !== expectedStoryStatus) {
      await storyDoc.ref.update({
        status: expectedStoryStatus,
        completedAt: expectedStoryStatus === "done" ? (d.completedAt || now) : null,
      })
      statusSynced++
    }
  }
  
  console.log(`\nPhase 4: Synced ${statusSynced} status mismatches`)
  
  // === FINAL REPORT ===
  const finalTasks = await db.collection("tasks").get()
  const finalStories = await db.collection("stories").get()
  let finalLinked = 0, finalUnlinked = 0
  for (const t of finalTasks.docs) {
    if (t.data().storyId) finalLinked++; else finalUnlinked++
  }
  
  console.log(`\n=== FINAL STATE ===`)
  console.log(`Tasks: ${finalTasks.size} (${finalLinked} linked, ${finalUnlinked} unlinked)`)
  console.log(`Stories: ${finalStories.size}`)
  console.log(`\n=== SYNC FIX COMPLETE ===`)
}

main().catch((err) => {
  console.error("Fix failed:", err)
  process.exit(1)
})
