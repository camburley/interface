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

async function fix() {
  const API_KEY = 'burley-api-token-2026';
  
  // Get current project list to see what's in Firestore via API
  const res = await fetch('https://www.burley.ai/api/admin/projects', {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });
  const data = await res.json();
  const dr = data.projects?.find(p => p.projectName === 'DolceRight Mobile App');
  console.log('API project ID for DolceRight:', dr?.id);
  
  // Get tasks to see their projectId
  const tasksRes = await fetch('https://www.burley.ai/api/admin/tasks?projectId=dolceright-mobile-app', {
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'X-Agent-Id': 'kevin' }
  });
  const tasksData = await tasksRes.json();
  console.log('Tasks with dolceright-mobile-app:', tasksData.tasks?.length);
  
  // The issue: API says project is "doleright-mobile-app", tasks use "dolceright-mobile-app"
  // We need to fix the project to match
  
  // First check if "doleright-mobile-app" exists in Firestore
  const wrongDoc = await db.collection('milestone_projects').doc('doleright-mobile-app').get();
  const correctDoc = await db.collection('milestone_projects').doc('dolceright-mobile-app').get();
  
  console.log('Firestore doleright-mobile-app exists:', wrongDoc.exists);
  console.log('Firestore dolceright-mobile-app exists:', correctDoc.exists);
  
  if (wrongDoc.exists && !correctDoc.exists) {
    // Rename: copy data to correct ID, delete wrong ID
    const data = wrongDoc.data();
    await db.collection('milestone_projects').doc('dolceright-mobile-app').set(data);
    await db.collection('milestone_projects').doc('doleright-mobile-app').delete();
    console.log('Fixed: renamed Firestore doc from doleright to dolceright');
  } else if (!wrongDoc.exists && correctDoc.exists) {
    console.log('Firestore already correct, API must be stale');
  }
}

fix().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
