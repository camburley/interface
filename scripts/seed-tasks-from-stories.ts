/**
 * Create board tasks from existing stories for internal + ops projects.
 * Each story becomes a Backlog task on the board.
 */
import { readFileSync } from "fs"
import { resolve } from "path"

// Load env
const envPath = resolve(__dirname, "../.env.local")
const envContent = readFileSync(envPath, "utf-8")
for (const line of envContent.split("\n")) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const eqIdx = trimmed.indexOf("=")
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx)
  let val = trimmed.slice(eqIdx + 1)
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
  process.env[key] = val
}

import { getFirebaseAdmin } from "../lib/firebase-admin"

const PROJECTS = [
  "bouncer-cash", "polymarket-bot", "supermarket-puzzle",
  "bob-ops", "content-pipeline", "agent-infra"
]

async function main() {
  const { db } = getFirebaseAdmin()
  
  // Get highest TASK number
  const allTasks = await db.collection("tasks").get()
  let maxNum = 0
  allTasks.docs.forEach(d => {
    const match = d.id.match(/^TASK-(\d+)$/)
    if (match) maxNum = Math.max(maxNum, parseInt(match[1]))
  })
  let taskNum = maxNum + 1

  for (const projectId of PROJECTS) {
    // Get milestones for this project
    const msSnap = await db.collection("milestones")
      .where("projectId", "==", projectId).get()
    
    for (const mDoc of msSnap.docs) {
      const mData = mDoc.data()
      
      // Get stories under this milestone
      const storiesSnap = await db.collection("stories")
        .where("milestoneId", "==", mDoc.id).get()
      
      for (const sDoc of storiesSnap.docs) {
        const sData = sDoc.data()
        const taskId = `TASK-${String(taskNum).padStart(3, "0")}`
        
        // Check if task already exists for this story
        const existing = await db.collection("tasks")
          .where("storyId", "==", sDoc.id)
          .where("projectId", "==", projectId).get()
        
        if (!existing.empty) {
          console.log(`  · Skip: ${sData.title} (task exists)`)
          continue
        }
        
        await db.collection("tasks").doc(taskId).set({
          title: sData.title,
          projectId: projectId,
          storyId: sDoc.id,
          milestoneId: mDoc.id,
          status: "backlog",
          priority: sData.kind === "bug" ? "high" : "medium",
          tags: [mData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")],
          description: "",
          acceptanceCriteria: [],
          definitionOfDone: [],
          hours: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        
        console.log(`  ✓ ${taskId}: ${sData.title} → ${projectId}`)
        taskNum++
      }
    }
  }
  
  console.log(`\nDone. Created tasks TASK-${String(maxNum + 1).padStart(3, "0")} through TASK-${String(taskNum - 1).padStart(3, "0")}.`)
}

main().catch(console.error)
