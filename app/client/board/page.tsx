import { redirect } from "next/navigation"
import { validateClientSession } from "@/lib/client-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { ClientBoardClient } from "./board-client"
import { BoardAgentChat } from "@/components/board-agent/board-agent-chat"
import type { Task } from "@/lib/types/task"
import { PROJECT_COLORS } from "@/lib/types/task"

export const dynamic = "force-dynamic"

export default async function ClientBoardPage() {
  const session = await validateClientSession()
  if (!session) redirect("/client/login?redirect=/client/board")

  const { db } = getFirebaseAdmin()

  const tasksSnap = await db
    .collection("tasks")
    .where("projectId", "==", session.projectId)
    .get()

  const tasks: Task[] = tasksSnap.docs.map((d) =>
    JSON.parse(JSON.stringify({ id: d.id, ...d.data() })) as Task,
  )

  const projectDoc = await db
    .collection("milestone_projects")
    .doc(session.projectId)
    .get()

  const projectName = projectDoc.exists
    ? (projectDoc.data()?.projectName as string) ?? "Project"
    : "Project"

  const projectColor = PROJECT_COLORS[0]

  const clientDoc = await db.collection("clients").doc(session.uid).get()
  const hasRepo = !!(clientDoc.data()?.githubRepo && clientDoc.data()?.githubPat)

  return (
    <>
      <ClientBoardClient
        initialTasks={tasks}
        projectName={projectName}
        projectColor={projectColor}
        clientName={session.clientName}
        repoConnected={hasRepo}
        projectId={session.projectId}
      />
      <BoardAgentChat
        projectId={session.projectId}
        projectName={projectName}
      />
    </>
  )
}
