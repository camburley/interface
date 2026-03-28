import { getFirebaseAdmin } from "../lib/firebase-admin";

async function fix() {
  const { db } = getFirebaseAdmin();
  
  const wrongId = "doleright-mobile-app";
  const correctId = "dolceright-mobile-app";
  
  // Delete the wrong ID doc
  const wrongDoc = await db.collection("milestone_projects").doc(wrongId).get();
  if (wrongDoc.exists) {
    await db.collection("milestone_projects").doc(wrongId).delete();
    console.log(`Deleted ${wrongId}`);
  }
  
  // Verify only correct remains
  const correctDoc = await db.collection("milestone_projects").doc(correctId).get();
  console.log(`${correctId} exists: ${correctDoc.exists}`);
  console.log(`projectName: ${correctDoc.data()?.projectName}`);
}

fix().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
