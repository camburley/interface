import { redirect } from "next/navigation"
import { getSessionUser, isAdmin } from "@/lib/session"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { ClientBoardClient } from "@/app/client/board/board-client"
import type { Task } from "@/lib/types/task"
import { PROJECT_COLORS } from "@/lib/types/task"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ clientId: string }>
}

export default async function AdminClientPreviewPage({ params }: PageProps) {
  const user = await getSessionUser()
  if (!user) redirect("/client/login?redirect=/admin/board")
  if (!isAdmin(user.uid)) redirect("/client/dashboard")

  const { clientId } = await params
  const { db } = getFirebaseAdmin()

  const clientDoc = await db.collection("clients").doc(clientId).get()
  if (!clientDoc.exists) redirect("/admin/board")

  const clientData = clientDoc.data()!
  const projectId = clientData.milestoneProjectId as string | undefined
  if (!projectId) redirect("/admin/board")

  const tasksSnap = await db
    .collection("tasks")
    .where("projectId", "==", projectId)
    .get()

  const tasks: Task[] = tasksSnap.docs.map((d) =>
    JSON.parse(JSON.stringify({ id: d.id, ...d.data() })) as Task,
  )

  const projectDoc = await db
    .collection("milestone_projects")
    .doc(projectId)
    .get()

  const projectName = projectDoc.exists
    ? (projectDoc.data()?.projectName as string) ?? "Project"
    : "Project"

  const projectColor = PROJECT_COLORS[0]
  const clientName = (clientData.name as string) ?? (clientData.email as string) ?? "Client"

  return (
    <ClientBoardClient
      initialTasks={tasks}
      projectName={projectName}
      projectColor={projectColor}
      clientName={clientName}
      adminPreview
      readOnly
    />
  )
}
