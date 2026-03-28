import { getFirebaseAdmin } from "../lib/firebase-admin";

async function fix() {
  const { db } = getFirebaseAdmin();
  
  const wrongId = "doleright-mobile-app";
  const correctId = "dolceright-mobile-app";
  
  // Get current state
  const wrongDoc = await db.collection("milestone_projects").doc(wrongId).get();
  const correctDoc = await db.collection("milestone_projects").doc(correctId).get();
  
  console.log("Before fix:");
  console.log(`  ${wrongId} exists: ${wrongDoc.exists}`);
  console.log(`  ${correctId} exists: ${correctDoc.exists}`);
  
  const tasksWrong = await db.collection("tasks").where("projectId", "==", wrongId).get();
  const tasksCorrect = await db.collection("tasks").where("projectId", "==", correctId).get();
  console.log(`  Tasks with ${wrongId}: ${tasksWrong.size}`);
  console.log(`  Tasks with ${correctId}: ${tasksCorrect.size}`);
  
  // Strategy: Make everything use correctId (dolceright)
  // Step 1: If wrongId project exists but correctId doesn't, rename it
  if (wrongDoc.exists && !correctDoc.exists) {
    const data = wrongDoc.data()!;
    await db.collection("milestone_projects").doc(correctId).set(data);
    await db.collection("milestone_projects").doc(wrongId).delete();
    console.log(`\nRenamed project: ${wrongId} → ${correctId}`);
  }
  
  // Step 2: Update any tasks with wrongId to use correctId
  if (tasksWrong.size > 0) {
    const batch = db.batch();
    tasksWrong.docs.forEach((doc) => {
      batch.update(doc.ref, { projectId: correctId });
    });
    await batch.commit();
    console.log(`Updated ${tasksWrong.size} tasks from ${wrongId} → ${correctId}`);
  }
  
  // Step 3: Verify
  const finalWrongProject = await db.collection("milestone_projects").doc(wrongId).get();
  const finalCorrectProject = await db.collection("milestone_projects").doc(correctId).get();
  const finalTasksWrong = await db.collection("tasks").where("projectId", "==", wrongId).get();
  const finalTasksCorrect = await db.collection("tasks").where("projectId", "==", correctId).get();
  
  console.log("\nAfter fix:");
  console.log(`  Project ${correctId} exists: ${finalCorrectProject.exists}`);
  console.log(`  Tasks with ${correctId}: ${finalTasksCorrect.size}`);
}

fix().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
