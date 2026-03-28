require('dotenv').config({ path: '.env.local' });
console.log('FIREBASE_PROJECT_ID from env:', process.env.FIREBASE_PROJECT_ID);

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
});
const db = getFirestore(app);

async function check() {
  const snap = await db.collection('milestone_projects').get();
  const dolce = snap.docs.filter(d => d.id.includes('dolce') || d.id.includes('doleright'));
  console.log('Dolce/Doleright projects in Firestore:');
  dolce.forEach(d => console.log(' -', d.id, '->', d.data().projectName));
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
