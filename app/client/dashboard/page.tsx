import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/session"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { DashboardClient } from "./dashboard-client"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) redirect("/client/login")

  const { db } = getFirebaseAdmin()

  // Fetch client profile
  const clientDoc = await db.collection("clients").doc(user.uid).get()
  if (!clientDoc.exists) redirect("/client/login")
  const client = { id: clientDoc.id, ...clientDoc.data() } as ClientData

  // Fetch retainer items (sort client-side to avoid composite index requirement)
  const itemsSnap = await db
    .collection("retainer_items")
    .where("clientId", "==", user.uid)
    .get()
  const items: RetainerItem[] = itemsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() } as RetainerItem))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  // Fetch payment history (sort client-side to avoid composite index requirement)
  const paymentsSnap = await db
    .collection("retainer_payments")
    .where("clientId", "==", user.uid)
    .get()
  const payments: RetainerPayment[] = paymentsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() } as RetainerPayment))
    .filter((p) => p.status === "completed")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return <DashboardClient client={client} items={items} payments={payments} />
}

export interface ClientData {
  id: string
  name: string
  email: string
  projectName: string
  milestoneProjectId?: string
  balance: number
  createdAt: string
}

export interface RetainerItem {
  id: string
  clientId: string
  title: string
  description: string
  estimatedCost: number
  actualCost: number | null
  status: "pending_approval" | "approved" | "in_progress" | "completed"
  createdAt: string
  completedAt: string | null
  approvedAt?: string
}

export interface RetainerPayment {
  id: string
  clientId: string
  amount: number
  stripeSessionId: string
  status: string
  createdAt: string
}
