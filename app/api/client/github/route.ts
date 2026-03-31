import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { getFirebaseAdmin } from "@/lib/firebase-admin"

export async function GET() {
  const user = await getSessionUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { db } = getFirebaseAdmin()
  const doc = await db.collection("clients").doc(user.uid).get()
  if (!doc.exists)
    return NextResponse.json({ error: "Client not found" }, { status: 404 })

  const data = doc.data()
  return NextResponse.json({
    githubRepo: data?.githubRepo ?? null,
    connected: !!(data?.githubRepo && data?.githubPat),
  })
}

export async function PUT(request: NextRequest) {
  const user = await getSessionUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const body = await request.json()
  const { githubRepo, githubPat } = body as {
    githubRepo?: string
    githubPat?: string
  }

  const { db } = getFirebaseAdmin()
  const ref = db.collection("clients").doc(user.uid)
  const doc = await ref.get()
  if (!doc.exists)
    return NextResponse.json({ error: "Client not found" }, { status: 404 })

  if (!githubRepo || !githubPat) {
    await ref.update({ githubRepo: null, githubPat: null })
    return NextResponse.json({ ok: true, connected: false })
  }

  const repoPattern = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/
  if (!repoPattern.test(githubRepo)) {
    return NextResponse.json(
      { error: "Invalid repo format. Use owner/repo (e.g. acme/my-app)" },
      { status: 400 },
    )
  }

  try {
    const testRes = await fetch(`https://api.github.com/repos/${githubRepo}`, {
      headers: {
        Authorization: `Bearer ${githubPat}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "burley-scoping",
      },
    })

    if (!testRes.ok) {
      if (testRes.status === 401) {
        return NextResponse.json({ error: "Invalid GitHub token" }, { status: 400 })
      }
      if (testRes.status === 404) {
        return NextResponse.json(
          { error: "Repository not found. Check the name and token permissions." },
          { status: 400 },
        )
      }
      return NextResponse.json({ error: "Could not verify repository access" }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: "Failed to connect to GitHub" }, { status: 502 })
  }

  await ref.update({ githubRepo, githubPat })
  return NextResponse.json({ ok: true, connected: true })
}

export async function DELETE() {
  const user = await getSessionUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { db } = getFirebaseAdmin()
  const ref = db.collection("clients").doc(user.uid)
  const doc = await ref.get()
  if (!doc.exists)
    return NextResponse.json({ error: "Client not found" }, { status: 404 })

  await ref.update({ githubRepo: null, githubPat: null })
  return NextResponse.json({ ok: true, connected: false })
}
