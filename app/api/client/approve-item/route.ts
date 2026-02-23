import { NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { getSessionUser } from "@/lib/session"

export async function POST(request: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { itemId } = await request.json()
  if (!itemId) {
    return NextResponse.json({ error: "Missing itemId" }, { status: 400 })
  }

  const { db } = getFirebaseAdmin()
  const itemRef = db.collection("retainer_items").doc(itemId)
  const itemDoc = await itemRef.get()

  if (!itemDoc.exists) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 })
  }

  const item = itemDoc.data()!

  // Ensure the item belongs to this client
  if (item.clientId !== user.uid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (item.status !== "pending_approval") {
    return NextResponse.json({ error: "Item is not pending approval" }, { status: 409 })
  }

  await itemRef.update({
    status: "approved",
    approvedAt: new Date().toISOString(),
    approvedByUid: user.uid,
  })

  return NextResponse.json({ ok: true })
}
