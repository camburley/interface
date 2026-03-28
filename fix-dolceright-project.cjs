require('dotenv').config({ path: '.env.local' });
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

function getFirebaseAdmin() {
  const existingApps = getApps();
  let app;
  
  if (existingApps.length > 0) {
    app = existingApps[0];
  } else {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
      throw new Error("Missing Firebase Admin credentials: " + JSON.stringify({
        hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY
      }));
    }
    
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }
  
  return { app, db: getFirestore(app) };
}

async function fixProjectId() {
  const { db } = getFirebaseAdmin();
  
  const wrongId = 'doleright-mobile-app';
  const correctId = 'dolceright-mobile-app';
  
  // Get the project doc
  const projectRef = db.collection('milestone_projects').doc(wrongId);
  const projectSnap = await projectRef.get();
  
  if (!projectSnap.exists) {
    console.log('Project not found:', wrongId);
    return;
  }
  
  const data = projectSnap.data();
  console.log('Found project:', data?.projectName);
  
  // Check if correct ID already exists
  const correctRef = db.collection('milestone_projects').doc(correctId);
  const correctSnap = await correctRef.get();
  
  if (correctSnap.exists) {
    console.log('Correct ID already exists - no action needed');
  } else {
    // Create new doc with correct ID, delete wrong one
    await correctRef.set(data);
    await projectRef.delete();
    console.log('Renamed project from', wrongId, 'to', correctId);
  }
  
  // Verify
  const tasksSnap = await db.collection('tasks')
    .where('projectId', '==', correctId)
    .get();
  console.log('Tasks with projectId:', correctId, '=', tasksSnap.size);
}

fixProjectId().then(() => { console.log('Done'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
