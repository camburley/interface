import { redirect } from "next/navigation"
import { validateClientSession } from "@/lib/client-auth"
import { buildWeeklyReportForClient } from "@/lib/weekly-report"
import { WeeklyReportClient } from "./weekly-report-client"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{ week?: string }>
}

export default async function ClientWeeklyReportPage({ searchParams }: PageProps) {
  const session = await validateClientSession()
  if (!session) {
    redirect("/client/login?redirect=/client/reports/weekly")
  }

  const params = await searchParams
  const report = await buildWeeklyReportForClient({
    clientId: session.uid,
    projectId: session.projectId,
    clientName: session.clientName,
    week: params.week ?? null,
  })

  return <WeeklyReportClient report={report} />
}
