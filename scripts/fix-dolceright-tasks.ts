import { getFirebaseAdmin } from "../lib/firebase-admin";

async function fix() {
  const { db } = getFirebaseAdmin();
  
  // The production API returns doleright-mobile-app (wrong spelling)
  // But tasks + Firestore doc have dolceright-mobile-app (correct)
  // We need to update tasks to match what API returns
  const wrongId = "doleright-mobile-app";
  const correctId = "dolceright-mobile-app";
  
  // Get all tasks with correct ID
  const tasksSnap = await db
    .collection("tasks")
    .where("projectId", "==", correctId)
    .get();
  
  console.log(`Found ${tasksSnap.size} tasks with ${correctId}`);
  
  if (tasksSnap.size === 0) {
    console.log("Nothing to fix");
    return;
  }
  
  // Update each task's projectId to the wrong spelling
  const batch = db.batch();
  tasksSnap.docs.forEach((doc) => {
    batch.update(doc.ref, { projectId: wrongId });
  });
  
  await batch.commit();
  console.log(`Updated ${tasksSnap.size} tasks to use ${wrongId}`);
}

fix()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
