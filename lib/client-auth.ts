import { getSessionUser } from "./session"
import { getFirebaseAdmin } from "./firebase-admin"

export interface ClientSession {
  uid: string
  email: string | undefined
  projectId: string
  clientName: string
}

export async function validateClientSession(): Promise<ClientSession | null> {
  const user = await getSessionUser()
  if (!user) return null

  const { db } = getFirebaseAdmin()
  const clientDoc = await db.collection("clients").doc(user.uid).get()
  if (!clientDoc.exists) return null

  const data = clientDoc.data()!
  const projectId = data.milestoneProjectId as string | undefined
  if (!projectId) return null

  return {
    uid: user.uid,
    email: user.email,
    projectId,
    clientName: (data.name as string) ?? "",
  }
}
