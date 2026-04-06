import { redirect } from "next/navigation"
import { getSessionUser, isAdmin } from "@/lib/session"
import { OpenClawAdmin } from "./openclaw-client"

export const dynamic = "force-dynamic"

export default async function OpenClawPage() {
  const user = await getSessionUser()
  if (!user) redirect("/client/login?redirect=/admin/openclaw")
  if (!isAdmin(user.uid)) redirect("/client/dashboard")

  return <OpenClawAdmin />
}
