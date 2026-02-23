import { NextRequest, NextResponse } from "next/server"
import { createSessionCookie, getSessionCookieOptions } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()
    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 })
    }

    const sessionCookie = await createSessionCookie(idToken)
    const options = getSessionCookieOptions()

    const response = NextResponse.json({ ok: true })
    response.cookies.set(options.name, sessionCookie, {
      httpOnly: options.httpOnly,
      secure: options.secure,
      sameSite: options.sameSite,
      path: options.path,
      maxAge: options.maxAge,
    })
    return response
  } catch (err) {
    console.error("Login error:", err)
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }
}
