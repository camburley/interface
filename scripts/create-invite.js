const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const crypto = require('crypto');

const app = getApps().find(a => a.name === 'inv') || initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
}, 'inv');

const auth = getAuth(app);
const db = getFirestore(app);
const email = process.argv[2];

if (!email) { console.error('Usage: node create-invite.js <email>'); process.exit(1); }

async function run() {
  // Get or create Firebase Auth user
  let uid;
  try {
    const existing = await auth.getUserByEmail(email);
    uid = existing.uid;
    console.log(`Using existing account: ${uid}`);
  } catch {
    const newUser = await auth.createUser({ email });
    uid = newUser.uid;
    console.log(`Created new account: ${uid}`);
  }

  // Generate a secure random token and store in Firestore
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

  await db.collection('invite_tokens').doc(token).set({ uid, email, expiresAt, createdAt: Date.now() });

  const link = `https://burley.ai/client/set-password?token=${token}`;
  console.log('\nInvite link (send this to the client):\n');
  console.log(link);
  console.log('\nExpires in 7 days.\n');
}

run().then(() => process.exit(0)).catch(e => { console.error(e.message); process.exit(1); });
