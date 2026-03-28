import { getFirebaseAdmin } from "../lib/firebase-admin";

async function fix() {
  const { db } = getFirebaseAdmin();
  
  // List all docs with dolce/doleright in the ID
  const allDocs = await db.collection("milestone_projects").get();
  const dolceDocs = allDocs.docs.filter(d => 
    d.id.includes("dolceright") || d.id.includes("doleright")
  );
  
  console.log("Dolce-related docs in milestone_projects:");
  for (const d of dolceDocs) {
    console.log(`  ${d.id} → ${d.data().projectName}`);
  }
  
  // Delete any docs that don't match the correct ID
  const correctId = "dolceright-mobile-app";
  const wrongIds = dolceDocs.filter(d => d.id !== correctId);
  
  for (const d of wrongIds) {
    await db.collection("milestone_projects").doc(d.id).delete();
    console.log(`Deleted: ${d.id}`);
  }
  
  // Verify only correct remains
  const remaining = await db.collection("milestone_projects").get();
  const remainingDolce = remaining.docs.filter(d => 
    d.id.includes("dolceright") || d.id.includes("doleright")
  );
  
  console.log("\nAfter cleanup:");
  for (const d of remainingDolce) {
    console.log(`  ${d.id} → ${d.data().projectName}`);
  }
}

fix().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
