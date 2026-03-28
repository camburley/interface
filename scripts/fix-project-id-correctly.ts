import { getFirebaseAdmin } from "../lib/firebase-admin";

async function fix() {
  const { db } = getFirebaseAdmin();
  
  const wrongId = "doleright-mobile-app";   // current - misspelled
  const correctId = "dolceright-mobile-app"; // desired - correct spelling
  
  // Get the project doc
  const wrongDoc = await db.collection("milestone_projects").doc(wrongId).get();
  const correctDoc = await db.collection("milestone_projects").doc(correctId).get();
  
  console.log(`${wrongId} exists: ${wrongDoc.exists}`);
  console.log(`${correctId} exists: ${correctDoc.exists}`);
  
  if (!wrongDoc.exists) {
    console.log("Wrong ID doesn't exist - nothing to rename");
    return;
  }
  
  if (correctDoc.exists) {
    console.log("Correct ID already exists!");
    return;
  }
  
  // Rename: create correct ID with same data, delete wrong ID
  const data = wrongDoc.data()!;
  await db.collection("milestone_projects").doc(correctId).set(data);
  await db.collection("milestone_projects").doc(wrongId).delete();
  console.log(`Renamed ${wrongId} → ${correctId}`);
  
  // Update all tasks to use correctId
  const tasksSnap = await db.collection("tasks").where("projectId", "==", wrongId).get();
  console.log(`Tasks with wrong projectId: ${tasksSnap.size}`);
  
  if (tasksSnap.size > 0) {
    const batch = db.batch();
    tasksSnap.docs.forEach((doc) => {
      batch.update(doc.ref, { projectId: correctId });
    });
    await batch.commit();
    console.log(`Updated ${tasksSnap.size} tasks to use ${correctId}`);
  }
}

fix().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
