import { getFirebaseAdmin } from "../lib/firebase-admin";

async function check() {
  const { db } = getFirebaseAdmin();
  
  // List all project docs
  const projectsSnap = await db.collection("milestone_projects").get();
  console.log("All milestone_projects docs:");
  projectsSnap.docs.forEach(d => {
    if (d.id.includes("dolce") || d.id.includes("doleright")) {
      console.log("  ", d.id, "->", d.data().projectName);
    }
  });
  
  // Count tasks with each variant
  const tasksWithWrong = await db.collection("tasks").where("projectId", "==", "doleright-mobile-app").get();
  const tasksWithCorrect = await db.collection("tasks").where("projectId", "==", "dolceright-mobile-app").get();
  console.log("\nTasks with doleright-mobile-app:", tasksWithWrong.size);
  console.log("Tasks with dolceright-mobile-app:", tasksWithCorrect.size);
  
  // Sample task projectIds
  const sampleTasks = await db.collection("tasks").limit(5).get();
  console.log("\nSample task projectIds:");
  sampleTasks.docs.forEach(d => {
    console.log("  ", d.data().projectId);
  });
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
