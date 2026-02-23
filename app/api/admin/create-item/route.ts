import { NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { getSessionUser, ADMIN_UID } from "@/lib/session"

export async function POST(request: NextRequest) {
  const user = await getSessionUser()
  if (!user || user.uid !== ADMIN_UID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { clientId, title, description, estimatedCost } = await request.json()
  if (!clientId || !title || estimatedCost == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const { db } = getFirebaseAdmin()

  const ref = await db.collection("retainer_items").add({
    clientId,
    title,
    description: description ?? "",
    estimatedCost: Number(estimatedCost),
    status: "pending_approval",
    actualCost: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
  })

  return NextResponse.json({ ok: true, id: ref.id })
}
