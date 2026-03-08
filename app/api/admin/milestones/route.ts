import { NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import type { MilestoneStatus, FundingSource } from "@/lib/types/milestone"

export async function GET(request: NextRequest) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const projectId = request.nextUrl.searchParams.get("projectId")
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 })

  const { db } = getFirebaseAdmin()
  const snap = await db.collection("milestones").where("projectId", "==", projectId).get()

  const milestones = await Promise.all(
    snap.docs.map(async (doc) => {
      const data = doc.data()
      const storiesSnap = await db
        .collection("stories")
        .where("milestoneId", "==", doc.id)
        .get()
      const stories = storiesSnap.docs
        .map((s) => ({ id: s.id, ...s.data() }))
        .sort((a, b) => ((a as Record<string, string>).createdAt ?? "").localeCompare((b as Record<string, string>).createdAt ?? ""))
      return { id: doc.id, ...data, stories }
    }),
  )

  milestones.sort((a, b) => ((a.order as number) ?? 0) - ((b.order as number) ?? 0))

  return NextResponse.json({ milestones })
}

export async function POST(request: NextRequest) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const body = await request.json()
  const { projectId, title, description, amount, fundingSource, fundingStatus, deliverables, completionCriteria, dueDate, order } = body

  if (!projectId || !title) {
    return NextResponse.json({ error: "projectId and title required" }, { status: 400 })
  }

  const { db } = getFirebaseAdmin()

  const data = {
    projectId,
    title,
    description: description ?? "",
    status: "draft" as MilestoneStatus,
    amount: Number(amount) || 0,
    fundingSource: (fundingSource ?? "upwork-escrow") as FundingSource,
    fundingStatus: fundingStatus ?? "pending",
    deliverables: deliverables ?? [],
    completionCriteria: completionCriteria ?? "",
    dueDate: dueDate ?? null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    order: order ?? 0,
  }

  const ref = await db.collection("milestones").add(data)
  return NextResponse.json({ ok: true, id: ref.id })
}
