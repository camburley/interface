import { redirect } from "next/navigation"
import { getSessionUser, ADMIN_UID } from "@/lib/session"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { AdminClient } from "./admin-client"
import type { ClientData, RetainerItem } from "../client/dashboard/page"

export default async function AdminPage() {
  const user = await getSessionUser()
  if (!user) redirect("/client/login?redirect=/admin")
  if (user.uid !== ADMIN_UID) redirect("/client/dashboard")

  const { db } = getFirebaseAdmin()

  const clientsSnap = await db.collection("clients").orderBy("createdAt", "desc").get()
  const clients: ClientData[] = clientsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ClientData))

  const itemsSnap = await db.collection("retainer_items").orderBy("createdAt", "desc").get()
  const items: RetainerItem[] = itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RetainerItem))

  return <AdminClient clients={clients} items={items} />
}
