import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/session"
import { MilestonesClientView } from "./milestones-client-view"

export default async function ClientMilestonesPage() {
  const user = await getSessionUser()
  if (!user) redirect("/client/login")

  return <MilestonesClientView userEmail={user.email} />
}
