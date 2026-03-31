import { redirect } from "next/navigation"
import { validateClientSession } from "@/lib/client-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { DEFAULT_EMAIL_PREFS, type EmailPreferences } from "@/lib/email"
import { SettingsClient } from "./settings-client"

export const dynamic = "force-dynamic"

export default async function ClientSettingsPage() {
  const session = await validateClientSession()
  if (!session) redirect("/client/login?redirect=/client/settings")

  const { db } = getFirebaseAdmin()
  const clientDoc = await db.collection("clients").doc(session.uid).get()
  const prefs = clientDoc.data()?.emailPreferences as Partial<EmailPreferences> | undefined

  return (
    <SettingsClient
      clientName={session.clientName}
      clientEmail={session.email ?? ""}
      initialPrefs={{ ...DEFAULT_EMAIL_PREFS, ...prefs }}
    />
  )
}
