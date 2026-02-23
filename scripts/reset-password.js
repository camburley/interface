const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const app = getApps().find(a => a.name === 'reset') || initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
}, 'reset');

const auth = getAuth(app);
const email = process.argv[2];

if (!email) { console.error('Usage: node reset-password.js <email>'); process.exit(1); }

auth.generatePasswordResetLink(email, { url: 'https://burley.ai/client/set-password', handleCodeInApp: true })
  .then(link => { console.log('\nPassword reset link:\n'); console.log(link); console.log(); process.exit(0); })
  .catch(e => { console.error('Error:', e.message); process.exit(1); });
