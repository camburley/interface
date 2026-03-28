import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const body = await request.json()

  if (!body.items || !Array.isArray(body.items)) {
    return NextResponse.json(
      { error: "items array is required" },
      { status: 400 },
    )
  }

  if (body.items.length > 50) {
    return NextResponse.json(
      { error: "Maximum 50 items per reorder call" },
      { status: 400 },
    )
  }

  for (const item of body.items) {
    if (!item.id || typeof item.position !== "number") {
      return NextResponse.json(
        { error: "Each item must have id (string) and position (number)" },
        { status: 400 },
      )
    }
  }

  const { db } = getFirebaseAdmin()
  const batch = db.batch()
  const now = new Date().toISOString()

  for (const item of body.items) {
    const ref = db.collection("tasks").doc(item.id)
    batch.update(ref, { position: item.position, updatedAt: now })
  }

  try {
    await batch.commit()
  } catch (err) {
    console.error("[reorder] batch commit failed:", err)
    return NextResponse.json(
      { error: "Failed to reorder tasks" },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, updated: body.items.length })
}
