import { NextRequest } from "next/server"
import { getSessionUser, isAdmin } from "./session"

const API_TOKEN = process.env.MILESTONES_API_TOKEN ?? ""

export interface AuthResult {
  authorized: boolean
  method: "bearer" | "session" | null
  actor: string
}

export async function validateBearerOrAdmin(
  request: NextRequest,
): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ") && API_TOKEN) {
    const token = authHeader.slice(7)
    if (token === API_TOKEN) {
      const actor =
        request.headers.get("x-agent-id") ??
        request.headers.get("x-actor") ??
        "api-agent"
      return { authorized: true, method: "bearer", actor }
    }
  }

  const user = await getSessionUser()
  if (user && isAdmin(user.uid)) {
    return { authorized: true, method: "session", actor: "admin" }
  }

  return { authorized: false, method: null, actor: "" }
}
