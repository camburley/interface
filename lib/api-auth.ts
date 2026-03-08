import { NextRequest } from "next/server"
import { getSessionUser, isAdmin } from "./session"

const API_TOKEN = process.env.MILESTONES_API_TOKEN ?? ""

export async function validateBearerOrAdmin(
  request: NextRequest,
): Promise<{ authorized: boolean; method: "bearer" | "session" | null }> {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ") && API_TOKEN) {
    const token = authHeader.slice(7)
    if (token === API_TOKEN) {
      return { authorized: true, method: "bearer" }
    }
  }

  const user = await getSessionUser()
  if (user && isAdmin(user.uid)) {
    return { authorized: true, method: "session" }
  }

  return { authorized: false, method: null }
}
