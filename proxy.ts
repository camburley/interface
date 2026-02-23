import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE = "__session"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get(SESSION_COOKIE)?.value

  // Protect /client/* and /admin/* — redirect to login if no session cookie
  if (!session) {
    const loginUrl = new URL("/client/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/client/dashboard/:path*", "/admin/:path*"],
}
