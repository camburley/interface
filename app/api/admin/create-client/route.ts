import { NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { getSessionUser, ADMIN_UID } from "@/lib/session"

export async function POST(request: NextRequest) {
  const user = await getSessionUser()
  if (!user || user.uid !== ADMIN_UID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { name, email, projectName } = await request.json()
  if (!name || !email || !projectName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const { auth, db } = getFirebaseAdmin()

  // Create Firebase Auth user
  let uid: string
  try {
    const existing = await auth.getUserByEmail(email).catch(() => null)
    if (existing) {
      uid = existing.uid
    } else {
      const newUser = await auth.createUser({ email, displayName: name })
      uid = newUser.uid
    }
  } catch (err) {
    console.error("Failed to create auth user:", err)
    return NextResponse.json({ error: "Failed to create auth user" }, { status: 500 })
  }

  // Create Firestore client document
  await db.collection("clients").doc(uid).set({
    name,
    email,
    projectName,
    balance: 0,
    createdAt: new Date().toISOString(),
  }, { merge: true })

  // Send password reset / invite email
  const link = await auth.generatePasswordResetLink(email)
  console.log(`Invite link for ${email}: ${link}`)

  return NextResponse.json({ ok: true, uid, inviteLink: link })
}
