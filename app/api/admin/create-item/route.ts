import { NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { getSessionUser, ADMIN_UID } from "@/lib/session"
import { sendClientEmail } from "@/lib/email"

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

  // Notify client
  const clientDoc = await db.collection("clients").doc(clientId).get()
  const client = clientDoc.data()
  if (client) {
    await sendClientEmail(
      client.email,
      `New scope item: ${title}`,
      `Hi ${client.name},\n\nA new item has been added to your project:\n\n"${title}" — $${estimatedCost}\n${description ? `\n${description}\n` : ""}\nLog in to review and approve: https://burley.ai/client/dashboard\n\n— Cam`
    )
  }

  return NextResponse.json({ ok: true, id: ref.id })
}
