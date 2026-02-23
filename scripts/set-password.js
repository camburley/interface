const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const app = getApps().find(a => a.name === 'setpw') || initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
}, 'setpw');

const auth = getAuth(app);
const [email, password] = process.argv.slice(2);

if (!email || !password) {
  console.error('Usage: node set-password.js <email> <password>');
  process.exit(1);
}

auth.getUserByEmail(email)
  .then(user => auth.updateUser(user.uid, { password }))
  .then(() => { console.log(`Password updated for ${email}`); process.exit(0); })
  .catch(e => { console.error('Error:', e.message); process.exit(1); });
