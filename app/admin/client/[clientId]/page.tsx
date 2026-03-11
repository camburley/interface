import { redirect } from "next/navigation"
import { getSessionUser, isAdmin } from "@/lib/session"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { DashboardClient } from "@/app/client/dashboard/dashboard-client"
import type { ClientData, RetainerItem, RetainerPayment } from "@/app/client/dashboard/page"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Props {
  params: Promise<{ clientId: string }>
}

export default async function AdminClientPreviewPage({ params }: Props) {
  const user = await getSessionUser()
  if (!user) redirect("/client/login?redirect=/admin")
  if (!isAdmin(user.uid)) redirect("/client/dashboard")

  const { clientId } = await params
  const { db } = getFirebaseAdmin()

  const clientDoc = await db.collection("clients").doc(clientId).get()
  if (!clientDoc.exists) redirect("/admin")
  const client = { id: clientDoc.id, ...clientDoc.data() } as ClientData

  const itemsSnap = await db
    .collection("retainer_items")
    .where("clientId", "==", clientId)
    .get()
  const items: RetainerItem[] = itemsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() } as RetainerItem))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const paymentsSnap = await db
    .collection("retainer_payments")
    .where("clientId", "==", clientId)
    .get()
  const payments: RetainerPayment[] = paymentsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() } as RetainerPayment))
    .filter((p) => p.status === "completed")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div>
      {/* Admin preview banner */}
      <div className="bg-amber-400/10 border-b border-amber-400/30 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-amber-400 uppercase tracking-widest">
              Admin Preview
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              — Viewing as {client.name} ({client.email})
            </span>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 font-mono text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Admin
          </Link>
        </div>
      </div>

      <DashboardClient
        client={client}
        items={items}
        payments={payments}
        milestonesHref={client.milestoneProjectId ? `/admin/projects/${client.milestoneProjectId}/milestones` : null}
      />
    </div>
  )
}
