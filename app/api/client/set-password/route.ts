import { NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()
    if (!token || !password) {
      return NextResponse.json({ error: "Missing token or password" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const { db, auth } = getFirebaseAdmin()

    // Look up the invite token in Firestore
    const tokenDoc = await db.collection("invite_tokens").doc(token).get()
    if (!tokenDoc.exists) {
      return NextResponse.json({ error: "Invite link is invalid or already used." }, { status: 400 })
    }

    const data = tokenDoc.data()!
    if (Date.now() > data.expiresAt) {
      await db.collection("invite_tokens").doc(token).delete()
      return NextResponse.json({ error: "Invite link has expired. Contact Cam for a new one." }, { status: 400 })
    }

    // Set the password via Admin SDK — no Firebase client auth needed
    await auth.updateUser(data.uid, { password })

    // Delete token so it can't be reused
    await db.collection("invite_tokens").doc(token).delete()

    return NextResponse.json({ ok: true, email: data.email })
  } catch (err) {
    console.error("Set password error:", err)
    return NextResponse.json({ error: "Server error. Try again." }, { status: 500 })
  }
}
