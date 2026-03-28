const { getFirebaseAdmin } = require('./lib/firebase-admin');

async function fixProjectId() {
  const { db } = getFirebaseAdmin();
  
  // The project doc ID is wrong (doleright instead of dolceright)
  const wrongId = 'doleright-mobile-app';
  const correctId = 'dolceright-mobile-app';
  
  // Get the project doc
  const projectRef = db.collection('milestone_projects').doc(wrongId);
  const projectSnap = await projectRef.get();
  
  if (!projectSnap.exists) {
    console.log('Project not found:', wrongId);
    return;
  }
  
  console.log('Found project:', projectSnap.data().projectName);
  
  // Check if correct ID already exists
  const correctRef = db.collection('milestone_projects').doc(correctId);
  const correctSnap = await correctRef.get();
  
  if (correctSnap.exists) {
    console.log('Correct ID already exists! Merging...');
    // Merge: copy project data, delete wrong ID
    const data = projectSnap.data();
    await correctRef.set(data);
    await projectRef.delete();
    console.log('Merged: copied to correct ID, deleted wrong ID');
  } else {
    // Just rename
    const data = projectSnap.data();
    await correctRef.set(data);
    await projectRef.delete();
    console.log('Renamed project from', wrongId, 'to', correctId);
  }
  
  // Verify task projectIds
  const tasksSnap = await db.collection('tasks')
    .where('projectId', '==', correctId)
    .get();
  console.log('Tasks with projectId:', correctId, '=', tasksSnap.size);
  
  const wrongTasksSnap = await db.collection('tasks')
    .where('projectId', '==', wrongId)
    .get();
  console.log('Tasks with projectId:', wrongId, '=', wrongTasksSnap.size);
}

fixProjectId().then(() => { console.log('Done'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
