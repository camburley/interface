import { NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { getSessionUser, ADMIN_UID } from "@/lib/session"
import crypto from "crypto"

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

  // Generate secure invite token (stored in Firestore, valid 7 days)
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000

  await db.collection("invite_tokens").doc(token).set({ uid, email, expiresAt, createdAt: Date.now() })

  const inviteLink = `https://burley.ai/client/set-password?token=${token}`

  return NextResponse.json({ ok: true, uid, inviteLink })
}
