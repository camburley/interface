import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/session"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { getProjectWithMilestones } from "@/lib/milestones-data"
import { MilestonesClientView } from "./milestones-client-view"

export default async function ClientMilestonesPage() {
  const user = await getSessionUser()
  if (!user) redirect("/client/login")

  const { db } = getFirebaseAdmin()
  const clientDoc = await db.collection("clients").doc(user.uid).get()
  if (!clientDoc.exists) redirect("/client/dashboard")

  const milestoneProjectId = clientDoc.data()?.milestoneProjectId as string | undefined
  if (!milestoneProjectId) redirect("/client/dashboard")

  const project = await getProjectWithMilestones(milestoneProjectId)
  if (!project) redirect("/client/dashboard")

  return <MilestonesClientView userEmail={user.email} project={project} />
}
