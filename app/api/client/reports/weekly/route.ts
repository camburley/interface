import { NextRequest, NextResponse } from "next/server"
import { validateClientSession } from "@/lib/client-auth"
import { buildWeeklyReportForClient } from "@/lib/weekly-report"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const session = await validateClientSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const week = request.nextUrl.searchParams.get("week")
  const report = await buildWeeklyReportForClient({
    clientId: session.uid,
    projectId: session.projectId,
    clientName: session.clientName,
    week,
  })

  return NextResponse.json(report)
}
