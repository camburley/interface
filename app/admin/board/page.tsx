import { redirect } from "next/navigation"
import { getSessionUser, isAdmin } from "@/lib/session"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { BoardClient } from "./board-client"
import type { Task } from "@/lib/types/task"
import type { BoardProject } from "@/lib/types/task"
import { PROJECT_COLORS } from "@/lib/types/task"

export const dynamic = "force-dynamic"

export default async function BoardPage() {
  const user = await getSessionUser()
  if (!user) redirect("/client/login?redirect=/admin/board")
  if (!isAdmin(user.uid)) redirect("/client/dashboard")

  const { db } = getFirebaseAdmin()

  const tasksSnap = await db.collection("tasks").get()
  const tasks: Task[] = tasksSnap.docs.map((d) => {
    const data = d.data()
    // Serialize Firestore Timestamps to ISO strings for client component
    return JSON.parse(JSON.stringify({ id: d.id, ...data })) as Task
  })

  const projectsSnap = await db.collection("milestone_projects").get()
  const projects: BoardProject[] = projectsSnap.docs.map((d, i) => ({
    id: d.id,
    name: d.data().projectName,
    color: PROJECT_COLORS[i % PROJECT_COLORS.length],
    clientName: d.data().clientName,
    boardType: d.data().boardType ?? "client",
  }))

  return <BoardClient initialTasks={tasks} projects={projects} />
}
