import { NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { validateBearerOrAdmin } from "@/lib/api-auth"

interface RouteContext {
  params: Promise<{ milestoneId: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { milestoneId } = await context.params
  const body = await request.json()
  const { db } = getFirebaseAdmin()

  const ref = db.collection("milestones").doc(milestoneId)
  const doc = await ref.get()
  if (!doc.exists) return NextResponse.json({ error: "Milestone not found" }, { status: 404 })

  const allowed = ["title", "description", "status", "amount", "fundingSource", "fundingStatus", "deliverables", "completionCriteria", "dueDate", "order"]
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  if (updates.status === "completed" && !doc.data()!.completedAt) {
    updates.completedAt = new Date().toISOString()
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  await ref.update(updates)
  return NextResponse.json({ ok: true, id: milestoneId })
}
