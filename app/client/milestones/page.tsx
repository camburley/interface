import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/session"
import { getProjectWithMilestones } from "@/lib/milestones-data"
import { MilestonesClientView } from "./milestones-client-view"

export default async function ClientMilestonesPage() {
  const user = await getSessionUser()
  if (!user) redirect("/client/login")

  const project = await getProjectWithMilestones("doleright-mobile-app")
  if (!project) redirect("/client/dashboard")

  return <MilestonesClientView userEmail={user.email} project={project} />
}
