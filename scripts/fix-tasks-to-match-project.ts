import { getFirebaseAdmin } from "../lib/firebase-admin";

async function fix() {
  const { db } = getFirebaseAdmin();
  
  const projectId = "doleright-mobile-app";  // what the API returns
  const taskProjectId = "dolceright-mobile-app"; // what tasks currently have
  
  // Get all tasks with the wrong projectId
  const tasksSnap = await db
    .collection("tasks")
    .where("projectId", "==", taskProjectId)
    .get();
  
  console.log(`Tasks with ${taskProjectId}: ${tasksSnap.size}`);
  
  if (tasksSnap.size === 0) {
    console.log("Nothing to fix");
    return;
  }
  
  // Update each task to use the correct projectId
  const batch = db.batch();
  tasksSnap.docs.forEach((doc) => {
    batch.update(doc.ref, { projectId: projectId });
  });
  
  await batch.commit();
  console.log(`Updated ${tasksSnap.size} tasks to use projectId: ${projectId}`);
}

fix().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
