import { redirect } from "next/navigation"
import { getSessionUser, isAdmin } from "@/lib/session"
import { EmailsClient } from "./emails-client"

export const dynamic = "force-dynamic"

export default async function AdminEmailsPage() {
  const user = await getSessionUser()
  if (!user) redirect("/client/login?redirect=/admin/emails")
  if (!isAdmin(user.uid)) redirect("/client/dashboard")

  return <EmailsClient />
}
