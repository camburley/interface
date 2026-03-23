import { redirect } from "next/navigation"
import { getSessionUser, isAdmin } from "@/lib/session"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { TrackerClient } from "./tracker-client"
import { PROJECT_COLORS } from "@/lib/types/task"
import type { TrackerProject } from "@/lib/stores/project-store"

export const dynamic = "force-dynamic"

export default async function TrackerPage() {
  const user = await getSessionUser()
  if (!user) redirect("/client/login?redirect=/admin/tracker")
  if (!isAdmin(user.uid)) redirect("/client/dashboard")

  const { db } = getFirebaseAdmin()

  const projectsSnap = await db.collection("milestone_projects").get()
  const projects: TrackerProject[] = await Promise.all(
    projectsSnap.docs.map(async (doc, idx) => {
      const data = doc.data()

      const msSnap = await db
        .collection("milestones")
        .where("projectId", "==", doc.id)
        .get()

      const milestones = await Promise.all(
        msSnap.docs.map(async (mDoc) => {
          const mData = mDoc.data()
          const storiesSnap = await db
            .collection("stories")
            .where("milestoneId", "==", mDoc.id)
            .get()
          return {
            id: mDoc.id,
            title: mData.title,
            status: mData.status,
            amount: mData.amount ?? 0,
            fundingStatus: mData.fundingStatus ?? "pending",
            order: mData.order ?? 0,
            storyCount: storiesSnap.size,
            completedStoryCount: storiesSnap.docs.filter(
              (s) => s.data().status === "done",
            ).length,
          }
        }),
      )

      milestones.sort((a, b) => a.order - b.order)

      const tasksSnap = await db
        .collection("tasks")
        .where("projectId", "==", doc.id)
        .get()

      const taskDocs = tasksSnap.docs.map((d) => d.data())
      const taskCounts = {
        total: taskDocs.length,
        done: taskDocs.filter((t) => t.status === "done").length,
        inProgress: taskDocs.filter((t) => t.status === "in_progress").length,
        blocked: taskDocs.filter((t) => t.status === "blocked").length,
      }

      const totalBudget = milestones.reduce((s, m) => s + m.amount, 0)
      const funded = milestones
        .filter((m) => m.fundingStatus === "funded")
        .reduce((s, m) => s + m.amount, 0)

      const latestTask = taskDocs.sort((a, b) =>
        (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
      )[0]

      const completed = milestones
        .filter((m) => m.status === "completed")
        .reduce((s, m) => s + m.amount, 0)
      const completedMilestoneCount = milestones.filter(
        (m) => m.status === "completed",
      ).length

      return {
        id: doc.id,
        clientName: data.clientName,
        projectName: data.projectName,
        boardType: data.boardType ?? "client",
        color: PROJECT_COLORS[idx % PROJECT_COLORS.length],
        milestones,
        taskCounts,
        totalBudget,
        funded,
        completed,
        completedMilestoneCount,
        lastActivity: latestTask?.updatedAt,
      }
    }),
  )

  return <TrackerClient initialProjects={projects} />
}
