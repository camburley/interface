import { getFirebaseAdmin } from "../lib/firebase-admin";

async function fix() {
  const { db } = getFirebaseAdmin();
  
  const wrongId = "doleright-mobile-app";
  const correctId = "dolceright-mobile-app";
  
  // Check current state
  const wrongDoc = await db.collection("milestone_projects").doc(wrongId).get();
  const correctDoc = await db.collection("milestone_projects").doc(correctId).get();
  
  if (wrongDoc.exists) {
    console.log(`${wrongId} already exists - no action needed`);
    return;
  }
  
  if (!correctDoc.exists) {
    console.log(`Neither doc exists! This is unexpected.`);
    return;
  }
  
  // Create the wrong ID doc by copying from correct doc
  const data = correctDoc.data()!;
  await db.collection("milestone_projects").doc(wrongId).set(data);
  console.log(`Created ${wrongId} as copy of ${correctId}`);
  
  // Verify
  const newDoc = await db.collection("milestone_projects").doc(wrongId).get();
  console.log(`Verification: ${wrongId} exists: ${newDoc.exists}`);
  console.log(`  projectName: ${newDoc.data()?.projectName}`);
}

fix().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
