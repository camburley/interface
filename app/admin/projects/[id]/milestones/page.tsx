import { redirect } from "next/navigation"
import { getSessionUser, isAdmin } from "@/lib/session"
import { MilestonesAdminClient } from "./milestones-admin"

export default async function AdminMilestonesPage() {
  const user = await getSessionUser()
  if (!user) redirect("/client/login?redirect=/admin")
  if (!isAdmin(user.uid)) redirect("/client/dashboard")

  return <MilestonesAdminClient />
}
