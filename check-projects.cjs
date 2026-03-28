require('dotenv').config({ path: '.env.local' });
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
  console.log('All projects:');
  snap.docs.forEach(d => {
    console.log(' -', d.id, '->', d.data().projectName, '(boardType:', d.data().boardType + ')');
  });
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
