import { getFirebaseAdmin } from "../lib/firebase-admin";

async function fix() {
  const { db } = getFirebaseAdmin();
  
  const wrongId = "doleright-mobile-app";
  const correctId = "dolceright-mobile-app";
  
  // Check what's in production Firestore
  const wrongDoc = await db.collection("milestone_projects").doc(wrongId).get();
  const correctDoc = await db.collection("milestone_projects").doc(correctId).get();
  
  console.log("Production Firestore state:");
  console.log(`  ${wrongId}: exists=${wrongDoc.exists}`);
  console.log(`  ${correctId}: exists=${correctDoc.exists}`);
  
  if (wrongDoc.exists && !correctDoc.exists) {
    // Need to rename wrongId to correctId
    const data = wrongDoc.data()!;
    await db.collection("milestone_projects").doc(correctId).set(data);
    await db.collection("milestone_projects").doc(wrongId).delete();
    console.log(`Renamed ${wrongId} → ${correctId}`);
  } else if (correctDoc.exists && !wrongDoc.exists) {
    console.log("Already correct - no action needed");
  } else if (correctDoc.exists && wrongDoc.exists) {
    console.log("Both exist - need to investigate");
  } else {
    console.log("Neither exists - need to investigate");
  }
  
  // Also check milestones for this project
  const msWrong = await db.collection("milestones").where("projectId", "==", wrongId).get();
  const msCorrect = await db.collection("milestones").where("projectId", "==", correctId).get();
  console.log(`\nMilestones with ${wrongId}: ${msWrong.size}`);
  console.log(`Milestones with ${correctId}: ${msCorrect.size}`);
  
  // And stories
  const storyWrong = await db.collection("stories").where("projectId", "==", wrongId).get();
  const storyCorrect = await db.collection("stories").where("projectId", "==", correctId).get();
  console.log(`Stories with ${wrongId}: ${storyWrong.size}`);
  console.log(`Stories with ${correctId}: ${storyCorrect.size}`);
}

fix().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
