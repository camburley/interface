import { redirect } from "next/navigation"
import { getSessionUser, isAdmin } from "@/lib/session"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { AdminClient } from "./admin-client"
import type { ClientData, RetainerItem } from "../client/dashboard/page"

export interface MilestoneProjectSummary {
  id: string
  clientName: string
  projectName: string
  milestoneCount: number
  completedCount: number
  totalBudget: number
  funded: number
}

export default async function AdminPage() {
  const user = await getSessionUser()
  if (!user) redirect("/client/login?redirect=/admin")
  if (!isAdmin(user.uid)) redirect("/client/dashboard")

  const { db } = getFirebaseAdmin()

  const clientsSnap = await db.collection("clients").orderBy("createdAt", "desc").get()
  const clients: ClientData[] = clientsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ClientData))

  const itemsSnap = await db.collection("retainer_items").orderBy("createdAt", "desc").get()
  const items: RetainerItem[] = itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RetainerItem))

  const projectsSnap = await db.collection("milestone_projects").get()
  const milestoneProjects: MilestoneProjectSummary[] = await Promise.all(
    projectsSnap.docs.map(async (doc) => {
      const data = doc.data()
      const msSnap = await db.collection("milestones").where("projectId", "==", doc.id).get()
      const milestones = msSnap.docs.map((m) => m.data())
      return {
        id: doc.id,
        clientName: data.clientName,
        projectName: data.projectName,
        milestoneCount: milestones.length,
        completedCount: milestones.filter((m) => m.status === "completed").length,
        totalBudget: milestones.reduce((s: number, m) => s + (m.amount ?? 0), 0),
        funded: milestones.filter((m) => m.fundingStatus === "funded").reduce((s: number, m) => s + (m.amount ?? 0), 0),
      }
    }),
  )

  return <AdminClient clients={clients} items={items} milestoneProjects={milestoneProjects} />
}
