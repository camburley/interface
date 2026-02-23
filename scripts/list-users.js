const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const app = getApps().find(a => a.name === 'list') || initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
}, 'list');

const auth = getAuth(app);

auth.listUsers(100).then(result => {
  result.users.forEach(u => console.log(`${u.uid}  ${u.email}`));
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
