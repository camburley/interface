import { NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { validateBearerOrAdmin } from "@/lib/api-auth"

interface RouteContext {
  params: Promise<{ milestoneId: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { milestoneId } = await context.params
  const { db } = getFirebaseAdmin()

  const snap = await db.collection("stories").where("milestoneId", "==", milestoneId).get()
  const stories = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => ((a as Record<string, string>).createdAt ?? "").localeCompare((b as Record<string, string>).createdAt ?? ""))

  return NextResponse.json({ stories })
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { milestoneId } = await context.params
  const body = await request.json()
  const { title, notes, outputUrl, specUrl, placeholder, kind } = body

  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 })

  const { db } = getFirebaseAdmin()

  const milestoneDoc = await db.collection("milestones").doc(milestoneId).get()
  if (!milestoneDoc.exists) return NextResponse.json({ error: "Milestone not found" }, { status: 404 })

  const data: Record<string, unknown> = {
    milestoneId,
    projectId: milestoneDoc.data()!.projectId,
    title,
    status: "todo",
    placeholder: Boolean(placeholder),
    notes: notes ?? "",
    outputUrl: outputUrl ?? null,
    specUrl: specUrl ?? null,
    attachments: [],
    createdAt: new Date().toISOString(),
    completedAt: null,
  }
  if (kind) data.kind = kind

  const ref = await db.collection("stories").add(data)
  return NextResponse.json({ ok: true, id: ref.id })
}
