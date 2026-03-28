import { getFirebaseAdmin } from "../lib/firebase-admin";

async function check() {
  const { db } = getFirebaseAdmin();
  
  // Get all milestone_projects
  const snap = await db.collection("milestone_projects").get();
  console.log("All milestone_projects in Firestore:");
  for (const d of snap.docs) {
    if (d.id.includes("dolce") || d.id.includes("doleright")) {
      console.log(`  ${d.id} → ${d.data().projectName}`);
    }
  }
  
  // Also check via API - list all task projectIds
  const tasks = await db.collection("tasks").limit(100).get();
  const projectIds = [...new Set(tasks.docs.map(d => d.data().projectId))];
  console.log("\nUnique projectIds in tasks (first 100):");
  for (const pid of projectIds.sort()) {
    if (pid.includes("dolce") || pid.includes("doleright")) {
      console.log(`  ${pid}`);
    }
  }
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
