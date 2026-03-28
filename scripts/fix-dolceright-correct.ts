import { getFirebaseAdmin } from "../lib/firebase-admin";

async function fix() {
  const { db } = getFirebaseAdmin();
  
  const wrongId = "doleright-mobile-app";  // missing 'h' - what API returns
  const correctId = "dolceright-mobile-app"; // correct spelling
  
  // First, undo my earlier mistake - restore tasks to correct spelling
  const tasksWithWrong = await db
    .collection("tasks")
    .where("projectId", "==", wrongId)
    .get();
  
  console.log(`Tasks with wrong projectId (${wrongId}): ${tasksWithWrong.size}`);
  
  if (tasksWithWrong.size > 0) {
    const batch = db.batch();
    tasksWithWrong.docs.forEach((doc) => {
      batch.update(doc.ref, { projectId: correctId });
    });
    await batch.commit();
    console.log(`Restored ${tasksWithWrong.size} tasks to correct spelling: ${correctId}`);
  }
  
  // Now rename the project doc to correct spelling
  const wrongDoc = await db.collection("milestone_projects").doc(wrongId).get();
  const correctDoc = await db.collection("milestone_projects").doc(correctId).get();
  
  console.log(`\nProject doc ${wrongId} exists: ${wrongDoc.exists}`);
  console.log(`Project doc ${correctId} exists: ${correctDoc.exists}`);
  
  if (wrongDoc.exists && !correctDoc.exists) {
    const data = wrongDoc.data()!;
    // Create new doc with correct ID
    await db.collection("milestone_projects").doc(correctId).set(data);
    // Delete old doc
    await db.collection("milestone_projects").doc(wrongId).delete();
    console.log(`Renamed project from ${wrongId} → ${correctId}`);
  } else if (correctDoc.exists) {
    console.log("Correct spelling already exists");
  } else {
    console.log("Could not find project to rename");
  }
  
  // Verify final state
  const finalTasks = await db.collection("tasks").where("projectId", "==", correctId).get();
  const finalProject = await db.collection("milestone_projects").doc(correctId).get();
  console.log(`\nFinal state:`);
  console.log(`  Tasks with ${correctId}: ${finalTasks.size}`);
  console.log(`  Project ${correctId} exists: ${finalProject.exists}`);
}

fix().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
