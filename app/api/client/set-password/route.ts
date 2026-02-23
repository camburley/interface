import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { oobCode, password } = await request.json()
    if (!oobCode || !password) {
      return NextResponse.json({ error: "Missing oobCode or password" }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_WEB_API_KEY

    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oobCode, newPassword: password }),
      }
    )

    const data = await res.json()
    if (!res.ok) {
      const code = data?.error?.message ?? "UNKNOWN"
      if (code.includes("EXPIRED") || code.includes("INVALID")) {
        return NextResponse.json({ error: "Invite link expired. Contact Cam for a new one." }, { status: 400 })
      }
      return NextResponse.json({ error: "Failed to set password." }, { status: 400 })
    }

    return NextResponse.json({ ok: true, email: data.email })
  } catch (err) {
    console.error("Set password error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
