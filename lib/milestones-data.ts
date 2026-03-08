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
    .orderBy("order")
    .get()

  const milestones: Milestone[] = await Promise.all(
    milestonesSnap.docs.map(async (doc) => {
      const data = doc.data()

      const storiesSnap = await db
        .collection("stories")
        .where("milestoneId", "==", doc.id)
        .orderBy("createdAt")
        .get()

      const stories: Story[] = storiesSnap.docs.map((s) => {
        const sd = s.data()
        return {
          id: s.id,
          title: sd.title,
          status: sd.status,
          notes: sd.notes || undefined,
          outputUrl: sd.outputUrl || undefined,
          specUrl: sd.specUrl || undefined,
          attachments: sd.attachments ?? [],
          createdAt: sd.createdAt,
          completedAt: sd.completedAt || undefined,
        }
      })

      return {
        id: doc.id,
        projectId: data.projectId,
        title: data.title,
        description: data.description || undefined,
        status: data.status,
        amount: data.amount,
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

  return {
    id: projectId,
    clientName: projectData.clientName,
    projectName: projectData.projectName,
    milestones,
  }
}
