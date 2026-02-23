const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = getApps().find(a => a.name === 'doc') || initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
}, 'doc');

const db = getFirestore(app);
const [uid, name, email, projectName] = process.argv.slice(2);

if (!uid || !name || !email || !projectName) {
  console.error('Usage: node create-client-doc.js <uid> <name> <email> <projectName>');
  process.exit(1);
}

db.collection('clients').doc(uid).set({
  name, email, projectName, balance: 0, createdAt: new Date().toISOString()
}, { merge: true })
.then(() => { console.log(`Client doc created for ${email}`); process.exit(0); })
.catch(e => { console.error(e.message); process.exit(1); });
