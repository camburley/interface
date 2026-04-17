import { redirect } from "next/navigation"
import { getSessionUser, isAdmin } from "@/lib/session"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { buildWeeklyReportForClient } from "@/lib/weekly-report"
import { WeeklyReportClient } from "@/app/client/reports/weekly/weekly-report-client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ clientId: string }>
  searchParams: Promise<{ week?: string }>
}

export default async function AdminClientWeeklyReportPage({ params, searchParams }: Props) {
  const user = await getSessionUser()
  if (!user || !isAdmin(user.uid)) {
    redirect("/client/login?redirect=/admin")
  }

  const { clientId } = await params
  const { week } = await searchParams
  const { db } = getFirebaseAdmin()
  const clientDoc = await db.collection("clients").doc(clientId).get()

  if (!clientDoc.exists) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Client not found
      </div>
    )
  }

  const data = clientDoc.data()!
  const projectId = data.milestoneProjectId as string | undefined

  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        No project linked to this client
      </div>
    )
  }

  const report = await buildWeeklyReportForClient({
    clientId,
    projectId,
    clientName: (data.name as string) ?? "Client",
    week: week ?? null,
  })

  return (
    <div>
      <div className="bg-amber-400/10 border-b border-amber-400/30 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/client/${clientId}`}
              className="text-amber-400/80 hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-amber-400/80 text-xs font-mono uppercase tracking-wider">
              Admin viewing as: {data.name ?? clientId}
            </span>
          </div>
        </div>
      </div>
      <WeeklyReportClient report={report} />
    </div>
  )
}
