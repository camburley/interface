import { cookies } from "next/headers"
import { getFirebaseAdmin } from "./firebase-admin"

const SESSION_COOKIE_NAME = "__session"
const SESSION_DURATION_MS = 60 * 60 * 24 * 14 * 1000 // 14 days

export async function createSessionCookie(idToken: string): Promise<string> {
  const { auth } = getFirebaseAdmin()
  return auth.createSessionCookie(idToken, { expiresIn: SESSION_DURATION_MS })
}

export async function getSessionUser(): Promise<{ uid: string; email: string | undefined } | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!sessionCookie) return null

  try {
    const { auth } = getFirebaseAdmin()
    const decoded = await auth.verifySessionCookie(sessionCookie, true)
    return { uid: decoded.uid, email: decoded.email }
  } catch {
    return null
  }
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME
}

export function getSessionCookieOptions(maxAge?: number) {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAge ?? SESSION_DURATION_MS / 1000,
  }
}

export const ADMIN_UID = process.env.ADMIN_UID ?? ""

const ADMIN_UIDS = (process.env.ADMIN_UID ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

export function isAdmin(uid: string): boolean {
  return ADMIN_UIDS.includes(uid)
}
