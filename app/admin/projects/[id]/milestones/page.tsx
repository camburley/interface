import { redirect, notFound } from "next/navigation"
import { getSessionUser, isAdmin } from "@/lib/session"
import { getProjectWithMilestones } from "@/lib/milestones-data"
import { MilestonesAdminClient } from "./milestones-admin"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminMilestonesPage({ params }: PageProps) {
  const user = await getSessionUser()
  if (!user) redirect("/client/login?redirect=/admin")
  if (!isAdmin(user.uid)) redirect("/client/dashboard")

  const { id } = await params
  const project = await getProjectWithMilestones(id)
  if (!project) notFound()

  return <MilestonesAdminClient project={project} />
}
