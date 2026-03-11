import { NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { getSessionUser, ADMIN_UID } from "@/lib/session"

export async function POST(request: NextRequest) {
  const user = await getSessionUser()
  if (!user || user.uid !== ADMIN_UID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { clientId, milestoneProjectId } = await request.json()
  if (!clientId) {
    return NextResponse.json({ error: "Missing clientId" }, { status: 400 })
  }

  const { db } = getFirebaseAdmin()
  const clientRef = db.collection("clients").doc(clientId)
  const clientDoc = await clientRef.get()
  if (!clientDoc.exists) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 })
  }

  if (milestoneProjectId) {
    const milestoneProjectDoc = await db.collection("milestone_projects").doc(milestoneProjectId).get()
    if (!milestoneProjectDoc.exists) {
      return NextResponse.json({ error: "Milestone project not found" }, { status: 404 })
    }
  }

  await clientRef.set(
    {
      milestoneProjectId: milestoneProjectId || null,
    },
    { merge: true },
  )

  return NextResponse.json({ ok: true })
}
