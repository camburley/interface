import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    )
  }

  // Accept both {items: [...]} and bare array [...]
  const raw = body as Record<string, unknown>
  const items = Array.isArray(body) ? body : Array.isArray(raw?.items) ? raw.items : null

  if (!items) {
    return NextResponse.json(
      { error: "items array is required — send {items: [{id, position}]} or [{id, position}]" },
      { status: 400 },
    )
  }

  if (items.length === 0) {
    return NextResponse.json({ ok: true, updated: 0 })
  }

  if (items.length > 50) {
    return NextResponse.json(
      { error: "Maximum 50 items per reorder call" },
      { status: 400 },
    )
  }

  const errors: string[] = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i] as Record<string, unknown>
    if (!item?.id || typeof item.id !== "string") {
      errors.push(`items[${i}]: missing or invalid id`)
    }
    if (typeof item?.position !== "number" || !Number.isInteger(item.position)) {
      errors.push(`items[${i}]: position must be an integer`)
    }
  }
  if (errors.length > 0) {
    return NextResponse.json(
      { error: "Validation failed", details: errors },
      { status: 400 },
    )
  }

  const { db } = getFirebaseAdmin()
  const batch = db.batch()
  const now = new Date().toISOString()

  for (const item of items as { id: string; position: number }[]) {
    const ref = db.collection("tasks").doc(item.id)
    batch.update(ref, { position: item.position, updatedAt: now })
  }

  try {
    await batch.commit()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[reorder] batch commit failed:", message)

    // Surface which task IDs may be invalid
    if (message.includes("NOT_FOUND")) {
      return NextResponse.json(
        { error: "One or more task IDs not found", details: message },
        { status: 404 },
      )
    }
    return NextResponse.json(
      { error: "Failed to reorder tasks", details: message },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, updated: items.length })
}
