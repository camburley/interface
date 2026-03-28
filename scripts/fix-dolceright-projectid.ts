import { getFirebaseAdmin } from "../lib/firebase-admin";

const wrongId = "doleright-mobile-app";
const correctId = "dolceright-mobile-app";

async function fix() {
  const { db } = getFirebaseAdmin();
  
  // Check current state
  const wrongDoc = await db.collection("milestone_projects").doc(wrongId).get();
  const correctDoc = await db.collection("milestone_projects").doc(correctId).get();
  
  console.log("Firestore state:");
  console.log("  - doleright-mobile-app (wrong):", wrongDoc.exists);
  console.log("  - dolceright-mobile-app (correct):", correctDoc.exists);
  
  // Get tasks count with each ID
  const tasksWrong = await db.collection("tasks").where("projectId", "==", wrongId).get();
  const tasksCorrect = await db.collection("tasks").where("projectId", "==", correctId).get();
  
  console.log("\nTasks:");
  console.log("  - Tasks with doleright-mobile-app:", tasksWrong.size);
  console.log("  - Tasks with dolceright-mobile-app:", tasksCorrect.size);
  
  if (tasksWrong.size > 0 && tasksCorrect.size > 0) {
    console.log("\nERROR: Both project IDs have tasks. Need manual resolution.");
    return;
  }
  
  if (tasksCorrect.size > 0 && correctDoc.exists) {
    console.log("\nFirestore is correct. Task projectIds match the doc ID.");
    console.log("The bug must be elsewhere - possibly in the API response caching or the board component.");
    return;
  }
  
  // Fix: Update all tasks from correctId to wrongId to match the project doc
  if (tasksCorrect.size > 0 && wrongDoc.exists && !correctDoc.exists) {
    console.log("\nFixing: Updating", tasksCorrect.size, "tasks to use wrongId:", wrongId);
    const batch = db.batch();
    tasksCorrect.docs.forEach((doc) => {
      batch.update(doc.ref, { projectId: wrongId });
    });
    await batch.commit();
    console.log("Done!");
  }
}

fix()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
