import { getFirebaseAdmin } from "../lib/firebase-admin";

async function check() {
  const { db, app } = getFirebaseAdmin();
  
  console.log("Firestore projectId:", app.options.projectId);
  
  // List collections
  const collections = await db.listCollections();
  console.log("Collections:", collections.map(c => c.id));
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
