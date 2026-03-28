import { getFirebaseAdmin } from "../lib/firebase-admin";

async function fix() {
  const { db } = getFirebaseAdmin();
  
  const wrongId = "doleright-mobile-app";  // what API returns
  const correctId = "dolceright-mobile-app"; // correct spelling
  
  // Get correct doc
  const correctDoc = await db.collection("milestone_projects").doc(correctId).get();
  
  if (!correctDoc.exists) {
    console.log("Correct doc not found!");
    return;
  }
  
  // Create the wrong ID as alias pointing to same data
  // This makes the API happy while preserving the correct spelling
  const data = correctDoc.data()!;
  await db.collection("milestone_projects").doc(wrongId).set(data);
  console.log(`Created alias ${wrongId} → ${correctId} (${data.projectName})`);
  
  // Verify API would now return consistent data
  const wrongDoc = await db.collection("milestone_projects").doc(wrongId).get();
  console.log(`${wrongId} exists: ${wrongDoc.exists}, name: ${wrongDoc.data()?.projectName}`);
}

fix().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
