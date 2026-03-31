import { NextRequest, NextResponse } from "next/server"
import { validateClientSession } from "@/lib/client-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  const session = await validateClientSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const raw = body as Record<string, unknown>
  const items = Array.isArray(body)
    ? body
    : Array.isArray(raw?.items)
      ? raw.items
      : null

  if (!items || items.length === 0) {
    return NextResponse.json({ ok: true, updated: 0 })
  }

  if (items.length > 50) {
    return NextResponse.json(
      { error: "Maximum 50 items per reorder call" },
      { status: 400 },
    )
  }

  const { db } = getFirebaseAdmin()

  for (const item of items as { id: string; position: number }[]) {
    const doc = await db.collection("tasks").doc(item.id).get()
    if (!doc.exists) {
      return NextResponse.json({ error: `Task ${item.id} not found` }, { status: 404 })
    }
    const data = doc.data()!
    if (data.projectId !== session.projectId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (data.status !== "todo") {
      return NextResponse.json(
        { error: "Only To Do tasks can be reordered" },
        { status: 400 },
      )
    }
  }

  const batch = db.batch()
  const now = new Date().toISOString()

  for (const item of items as { id: string; position: number }[]) {
    const ref = db.collection("tasks").doc(item.id)
    batch.update(ref, { position: item.position, updatedAt: now })
  }

  await batch.commit()

  return NextResponse.json({ ok: true, updated: items.length })
}
