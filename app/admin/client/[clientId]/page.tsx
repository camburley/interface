import { redirect } from "next/navigation"
import { getSessionUser, isAdmin } from "@/lib/session"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { DashboardClient } from "@/app/client/dashboard/dashboard-client"
import { SubscriptionDashboardClient } from "@/app/client/dashboard/subscription-dashboard"
import type { ClientData, RetainerItem, RetainerPayment } from "@/app/client/dashboard/page"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Stripe from "stripe"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ clientId: string }>
}

function AdminBanner({ client }: { client: ClientData }) {
  return (
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
  )
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
  const clientType = (clientDoc.data()?.clientType as string) ?? "retainer"

  if (clientType === "subscription") {
    const projectId = clientDoc.data()?.milestoneProjectId as string | undefined
    const stripeCustomerId = clientDoc.data()?.stripeCustomerId as string | undefined

    let taskCounts = { todo: 0, in_progress: 0, review: 0, done: 0 }
    if (projectId) {
      const tasksSnap = await db.collection("tasks").where("projectId", "==", projectId).get()
      for (const doc of tasksSnap.docs) {
        const status = doc.data().status as string
        if (status in taskCounts) taskCounts[status as keyof typeof taskCounts]++
      }
    }

    let subscriptionData = undefined
    if (stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-01-27.acacia" })
        const subs = await stripe.subscriptions.list({ customer: stripeCustomerId, status: "all", limit: 1 })
        if (subs.data.length > 0) {
          const s = subs.data[0]
          const price = s.items.data[0]?.price
          const tier = (clientDoc.data()?.subscriptionTier as string) ?? "core"
          const tierLabels: Record<string, string> = { continuity: "Continuity", core: "Core", priority: "Priority" }
          subscriptionData = {
            id: s.id,
            status: s.status,
            tierKey: tier,
            tierLabel: tierLabels[tier] ?? tier,
            amountCents: price?.unit_amount ?? 0,
            interval: price?.recurring?.interval ?? "month",
            currentPeriodStart: s.current_period_start,
            currentPeriodEnd: s.current_period_end,
            cancelAtPeriodEnd: s.cancel_at_period_end,
            created: s.created,
          }
        }
      } catch (err) {
        console.error("[admin-preview] Stripe fetch failed for customer", stripeCustomerId, err)
      }
    }

    console.log("[admin-preview] subscriptionData resolved:", subscriptionData ? "found" : "undefined", "| stripeCustomerId:", stripeCustomerId)

    return (
      <div>
        <AdminBanner client={client} />
        <SubscriptionDashboardClient
          clientName={client.name}
          clientEmail={client.email}
          projectName={client.projectName}
          milestoneProjectId={client.milestoneProjectId}
          initialTaskCounts={taskCounts}
          boardHref={`/admin/board/client/${clientId}`}
          subscriptionData={subscriptionData}
        />
      </div>
    )
  }

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
      <AdminBanner client={client} />
      <DashboardClient
        client={client}
        items={items}
        payments={payments}
        milestonesHref={client.milestoneProjectId ? `/admin/projects/${client.milestoneProjectId}/milestones` : null}
      />
    </div>
  )
}
