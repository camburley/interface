import { NextRequest, NextResponse } from "next/server"
import { validateBearerOrAdmin } from "@/lib/api-auth"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { PROJECT_COLORS } from "@/lib/types/task"
import type { BoardType } from "@/lib/types/milestone"

const VALID_BOARD_TYPES: BoardType[] = ["client", "internal", "ops"]

export async function GET(request: NextRequest) {
  const { authorized } = await validateBearerOrAdmin(request)
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { db } = getFirebaseAdmin()

  const boardType = request.nextUrl.searchParams.get("boardType") as BoardType | null

  let projectsQuery: FirebaseFirestore.Query = db.collection("milestone_projects")
  if (boardType && VALID_BOARD_TYPES.includes(boardType)) {
    projectsQuery = projectsQuery.where("boardType", "==", boardType)
  }

  const projectsSnap = await projectsQuery.get()
  const projects = await Promise.all(
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
            includeInTotals: mData.includeInTotals !== false,
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
      const countedMilestones = milestones.filter((m) => m.includeInTotals !== false)

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

      const totalBudget = countedMilestones.reduce((s, m) => s + m.amount, 0)
      const funded = countedMilestones
        .filter((m) => m.fundingStatus === "funded")
        .reduce((s, m) => s + m.amount, 0)
      const completed = countedMilestones
        .filter((m) => m.status === "completed")
        .reduce((s, m) => s + m.amount, 0)
      const completedMilestoneCount = countedMilestones.filter(
        (m) => m.status === "completed",
      ).length

      const latestTask = taskDocs.sort((a, b) =>
        (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
      )[0]

      return {
        id: doc.id,
        clientName: data.clientName,
        projectName: data.projectName,
        boardType: (data.boardType ?? "client") as BoardType,
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

  return NextResponse.json({ projects })
}
