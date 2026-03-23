/**
 * Backfill boardType on existing milestone_projects documents.
 * Sets boardType="client" on any project that doesn't have one.
 * 
 * Run: npx tsx scripts/backfill-board-type.ts
 */

import { getFirebaseAdmin } from "../lib/firebase-admin"

async function main() {
  const { db } = getFirebaseAdmin()
  const snap = await db.collection("milestone_projects").get()

  let updated = 0
  for (const doc of snap.docs) {
    const data = doc.data()
    if (!data.boardType) {
      await doc.ref.update({ boardType: "client" })
      console.log(`✓ ${doc.id} → boardType: "client"`)
      updated++
    } else {
      console.log(`· ${doc.id} → already has boardType: "${data.boardType}"`)
    }
  }

  console.log(`\nDone. Updated ${updated} of ${snap.size} projects.`)
}

main().catch(console.error)
