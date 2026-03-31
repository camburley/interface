import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { DEFAULT_EMAIL_PREFS, type EmailPreferences } from "@/lib/email"

export async function GET() {
  const user = await getSessionUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { db } = getFirebaseAdmin()
  const doc = await db.collection("clients").doc(user.uid).get()
  if (!doc.exists)
    return NextResponse.json({ error: "Client not found" }, { status: 404 })

  const prefs = doc.data()?.emailPreferences as Partial<EmailPreferences> | undefined

  return NextResponse.json({
    preferences: { ...DEFAULT_EMAIL_PREFS, ...prefs },
  })
}

export async function PUT(request: NextRequest) {
  const user = await getSessionUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const body = await request.json()
  const { preferences } = body as { preferences: Partial<EmailPreferences> }

  if (!preferences || typeof preferences !== "object") {
    return NextResponse.json({ error: "Invalid preferences" }, { status: 400 })
  }

  const allowed: (keyof EmailPreferences)[] = [
    "taskDone",
    "taskInProgress",
    "taskReview",
    "weeklySummary",
  ]

  const sanitized: Partial<EmailPreferences> = {}
  for (const key of allowed) {
    if (typeof preferences[key] === "boolean") {
      sanitized[key] = preferences[key]
    }
  }

  const { db } = getFirebaseAdmin()
  const ref = db.collection("clients").doc(user.uid)
  const doc = await ref.get()
  if (!doc.exists)
    return NextResponse.json({ error: "Client not found" }, { status: 404 })

  const existing = doc.data()?.emailPreferences ?? {}
  await ref.update({
    emailPreferences: { ...DEFAULT_EMAIL_PREFS, ...existing, ...sanitized },
  })

  return NextResponse.json({ ok: true })
}
