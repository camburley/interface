import { NextRequest, NextResponse } from "next/server"
import { getSessionUser, isAdmin } from "@/lib/session"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { DEFAULT_EMAIL_PREFS, sendWeeklySummaryEmail } from "@/lib/email"
import { buildWeeklyReportForClient, parseWeekRange } from "@/lib/weekly-report"

function isAuthorizedBySecret(request: NextRequest): boolean {
  const configured = process.env.WEEKLY_REPORTS_SECRET
  if (!configured) return false
  const provided = request.headers.get("x-weekly-reports-secret")
  return !!provided && provided === configured
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser()
  const authedBySession = !!user && isAdmin(user.uid)
  const authedBySecret = isAuthorizedBySecret(request)

  if (!authedBySession && !authedBySecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const weekInput = typeof body.week === "string" ? body.week : request.nextUrl.searchParams.get("week")
  const week = parseWeekRange(weekInput).week

  const { db } = getFirebaseAdmin()
  const clientsSnap = await db.collection("clients").get()

  const summary = {
    week,
    totalClients: clientsSnap.size,
    sent: 0,
    skipped: 0,
    failed: 0,
    details: [] as Array<{
      clientId: string
      email?: string
      action: "sent" | "skipped" | "failed"
      reason?: string
    }>,
  }

  for (const clientDoc of clientsSnap.docs) {
    const data = clientDoc.data()
    const clientId = clientDoc.id
    const email = data.email as string | undefined
    const projectId = data.milestoneProjectId as string | undefined
    const prefs = {
      ...DEFAULT_EMAIL_PREFS,
      ...(data.emailPreferences as Record<string, boolean> | undefined),
    }

    if (!prefs.weeklySummary) {
      summary.skipped += 1
      summary.details.push({
        clientId,
        email,
        action: "skipped",
        reason: "weeklySummary disabled",
      })
      continue
    }

    if (!email || !projectId) {
      summary.skipped += 1
      summary.details.push({
        clientId,
        email,
        action: "skipped",
        reason: "missing email or milestoneProjectId",
      })
      continue
    }

    try {
      const report = await buildWeeklyReportForClient({
        clientId,
        projectId,
        clientName: (data.name as string | undefined) ?? "Client",
        week,
      })

      const sent = await sendWeeklySummaryEmail(email, {
        clientName: report.clientName,
        projectName: report.projectName,
        week: report.week,
        weekRangeLabel: report.weekRangeLabel,
        completed: report.completed.map((task) => ({
          title: task.title,
          oneLineSummary: task.oneLineSummary,
          videoUrl: task.video?.url ?? null,
          prUrl: task.prUrl,
        })),
        progress: report.progress,
        upNext: report.upNext.map((task) => ({ taskId: task.taskId, title: task.title })),
        timelineNote: report.timelineNote,
        reportUrl: report.reportUrl,
      })

      if (sent) {
        summary.sent += 1
        summary.details.push({ clientId, email, action: "sent" })
      } else {
        summary.failed += 1
        summary.details.push({
          clientId,
          email,
          action: "failed",
          reason: "send provider returned false",
        })
      }
    } catch (error) {
      summary.failed += 1
      summary.details.push({
        clientId,
        email,
        action: "failed",
        reason: error instanceof Error ? error.message : "unknown error",
      })
    }
  }

  return NextResponse.json(summary)
}
