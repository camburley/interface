import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  return NextResponse.json({
    WEEKLY: process.env.WEEKLY_REPORTS_SECRET?.substring(0, 10) ?? "NOT_SET",
    RESEND: process.env.RESEND_API_KEY?.substring(0, 10) ?? "NOT_SET",
    GITHUB: process.env.GITHUB_TOKEN?.substring(0, 10) ?? "NOT_SET",
    FIREBASE: process.env.FIREBASE_PROJECT_ID?.substring(0, 10) ?? "NOT_SET",
    ADMIN: process.env.ADMIN_UID?.substring(0, 10) ?? "NOT_SET",
    NODE_ENV: process.env.NODE_ENV,
  })
}
