import { NextResponse } from "next/server"
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
  const githubRepo = data?.githubRepo as string | undefined
  const githubPat = data?.githubPat as string | undefined

  if (!githubRepo || !githubPat) {
    return NextResponse.json({ error: "No GitHub repository connected" }, { status: 404 })
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${githubRepo}/git/trees/main?recursive=1`,
      {
        headers: {
          Authorization: `Bearer ${githubPat}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "burley-scoping",
        },
      },
    )

    if (!res.ok) {
      const errText = await res.text()
      console.error("[github-tree] GitHub API error:", res.status, errText)

      if (res.status === 401) {
        return NextResponse.json({ error: "GitHub token is invalid or expired" }, { status: 401 })
      }
      if (res.status === 404) {
        return NextResponse.json({ error: "Repository not found or inaccessible" }, { status: 404 })
      }

      return NextResponse.json({ error: "Failed to fetch repository" }, { status: 502 })
    }

    const treeData = await res.json()
    const paths = (treeData.tree as { path: string; type: string }[])
      .filter(
        (n) =>
          n.type === "blob" &&
          !n.path.includes("node_modules/") &&
          !n.path.includes(".git/") &&
          !n.path.includes("dist/") &&
          !n.path.includes(".next/"),
      )
      .map((n) => n.path)
      .slice(0, 500)

    return NextResponse.json({
      repo: githubRepo,
      fileCount: paths.length,
      tree: paths,
    })
  } catch (err) {
    console.error("[github-tree] fetch error:", err)
    return NextResponse.json({ error: "Failed to connect to GitHub" }, { status: 502 })
  }
}
