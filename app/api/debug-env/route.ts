import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const configured = process.env.WEEKLY_REPORTS_SECRET
  const provided = request.headers.get("x-weekly-reports-secret")
  
  return NextResponse.json({
    hasConfigured: !!configured,
    configuredLength: configured?.length ?? 0,
    providedLength: provided?.length ?? 0,
    match: configured === provided,
    configuredPrefix: configured?.substring(0, 5),
    providedPrefix: provided?.substring(0, 5),
  })
}
