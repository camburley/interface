import { NextRequest, NextResponse } from "next/server"
import { createSessionCookie, getSessionCookieOptions } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    let idToken: string

    if (body.idToken) {
      // Legacy: client already has an ID token
      idToken = body.idToken
    } else if (body.email && body.password) {
      // Server-side sign-in via Firebase REST API (no authorized domain needed)
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_WEB_API_KEY
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: body.email, password: body.password, returnSecureToken: true }),
        }
      )
      const data = await res.json()
      if (!res.ok || !data.idToken) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
      }
      idToken = data.idToken
    } else {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
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
