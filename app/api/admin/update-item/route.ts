import { NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { getSessionUser, ADMIN_UID } from "@/lib/session"
import { sendClientEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  const user = await getSessionUser()
  if (!user || user.uid !== ADMIN_UID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { itemId, status, actualCost } = await request.json()
  if (!itemId || !status) {
    return NextResponse.json({ error: "Missing itemId or status" }, { status: 400 })
  }

  const validStatuses = ["pending_approval", "approved", "in_progress", "completed"]
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const { db } = getFirebaseAdmin()

  const itemRef = db.collection("retainer_items").doc(itemId)
  const itemDoc = await itemRef.get()
  if (!itemDoc.exists) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 })
  }

  const item = itemDoc.data()!
  const clientRef = db.collection("clients").doc(item.clientId)
  const clientDoc = await clientRef.get()
  const client = clientDoc.data()

  const updates: Record<string, unknown> = { status }

  if (status === "completed") {
    const cost = actualCost != null ? Number(actualCost) : item.estimatedCost
    updates.actualCost = cost
    updates.completedAt = new Date().toISOString()

    // Deduct from client balance
    if (client) {
      const newBalance = Math.max(0, (client.balance ?? 0) - cost)
      await clientRef.update({ balance: newBalance })

      await sendClientEmail(
        client.email,
        `Work completed: ${item.title}`,
        `Hi ${client.name},\n\nWork on "${item.title}" is now complete.\n\nCost: $${cost}\nRemaining balance: $${newBalance}\n\nView details: https://burley.ai/client/dashboard\n\n— Cam`
      )
    }
  } else if (status === "in_progress") {
    if (client) {
      await sendClientEmail(
        client.email,
        `Work started: ${item.title}`,
        `Hi ${client.name},\n\nWork has started on "${item.title}".\n\nEstimated cost: $${item.estimatedCost}\n\nView details: https://burley.ai/client/dashboard\n\n— Cam`
      )
    }
  }

  await itemRef.update(updates)

  return NextResponse.json({ ok: true })
}
