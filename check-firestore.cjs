require('dotenv').config({ path: '.env.local' });
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
});
const db = getFirestore(app);

async function check() {
  // Check both possible IDs
  const wrong = await db.collection('milestone_projects').doc('doleright-mobile-app').get();
  const correct = await db.collection('milestone_projects').doc('dolceright-mobile-app').get();
  console.log('doleright-mobile-app (wrong):', wrong.exists, wrong.exists ? wrong.data().projectName : 'N/A');
  console.log('dolceright-mobile-app (correct):', correct.exists, correct.exists ? correct.data().projectName : 'N/A');
  
  // List all project IDs
  const snap = await db.collection('milestone_projects').get();
  const ids = snap.docs.map(d => d.id);
  console.log('All project IDs:', ids.filter(id => id.includes('dolceright') || id.includes('doleright')));
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
