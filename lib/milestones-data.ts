import { getFirebaseAdmin } from "./firebase-admin"
import type { MilestoneProject, Milestone, Story } from "./types/milestone"

export async function getProjectWithMilestones(projectId: string): Promise<MilestoneProject | null> {
  const { db } = getFirebaseAdmin()

  const projectDoc = await db.collection("milestone_projects").doc(projectId).get()
  if (!projectDoc.exists) return null

  const projectData = projectDoc.data()!

  const milestonesSnap = await db
    .collection("milestones")
    .where("projectId", "==", projectId)
    .get()

  const milestones: Milestone[] = await Promise.all(
    milestonesSnap.docs.map(async (doc) => {
      const data = doc.data()

      const storiesSnap = await db
        .collection("stories")
        .where("milestoneId", "==", doc.id)
        .get()

      const stories: Story[] = storiesSnap.docs
        .map((s) => {
          const sd = s.data()
          return {
            id: s.id,
            title: sd.title,
            status: sd.status,
            kind: sd.kind || undefined,
            placeholder: sd.placeholder ?? false,
            notes: sd.notes || undefined,
            outputUrl: sd.outputUrl || undefined,
            specUrl: sd.specUrl || undefined,
            attachments: sd.attachments ?? [],
            createdAt: sd.createdAt,
            completedAt: sd.completedAt || undefined,
          }
        })
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

      return {
        id: doc.id,
        projectId: data.projectId,
        title: data.title,
        description: data.description || undefined,
        status: data.status,
        amount: data.amount,
        includeInTotals: data.includeInTotals !== false,
        kind: data.kind || undefined,
        fundingSource: data.fundingSource,
        fundingStatus: data.fundingStatus,
        deliverables: data.deliverables ?? [],
        completionCriteria: data.completionCriteria || undefined,
        stories,
        dueDate: data.dueDate || undefined,
        createdAt: data.createdAt,
        completedAt: data.completedAt || undefined,
        order: data.order,
      }
    }),
  )

  milestones.sort((a, b) => a.order - b.order)

  const projectName =
    projectId === "dolceright-mobile-app" ? "DolceRight" : projectData.projectName

  return {
    id: projectId,
    clientName: projectData.clientName,
    projectName,
    milestones,
  }
}
