import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import type { BoardType } from "@/lib/types/milestone"

const VALID_BOARD_TYPES: BoardType[] = ["client", "internal", "ops"]

export async function GET(request: NextRequest) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { db } = getFirebaseAdmin()
  const boardType = request.nextUrl.searchParams.get("boardType") as BoardType | null

  let query: FirebaseFirestore.Query = db.collection("milestone_projects")
  if (boardType && VALID_BOARD_TYPES.includes(boardType)) {
    query = query.where("boardType", "==", boardType)
  }

  const snap = await query.get()
  const projects = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))

  return NextResponse.json({ projects })
}

export async function POST(request: NextRequest) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const body = await request.json()
  const { id, clientName, projectName, boardType } = body as {
    id?: string
    clientName: string
    projectName: string
    boardType: BoardType
  }

  if (!clientName || !projectName) {
    return NextResponse.json(
      { error: "clientName and projectName are required" },
      { status: 400 },
    )
  }

  if (boardType && !VALID_BOARD_TYPES.includes(boardType)) {
    return NextResponse.json(
      { error: `boardType must be one of: ${VALID_BOARD_TYPES.join(", ")}` },
      { status: 400 },
    )
  }

  const { db } = getFirebaseAdmin()
  const now = new Date().toISOString()
  const data = {
    clientName,
    projectName,
    boardType: boardType ?? "client",
    createdAt: now,
  }

  let ref: FirebaseFirestore.DocumentReference
  if (id) {
    const existing = await db.collection("milestone_projects").doc(id).get()
    if (existing.exists) {
      return NextResponse.json(
        { error: `Project "${id}" already exists` },
        { status: 409 },
      )
    }
    ref = db.collection("milestone_projects").doc(id)
    await ref.set(data)
  } else {
    ref = await db.collection("milestone_projects").add(data)
  }

  return NextResponse.json({ ok: true, id: ref.id, ...data })
}
