export type MilestoneStatus = "draft" | "active" | "completed" | "on-hold"
export type StoryStatus = "todo" | "in-progress" | "review" | "done" | "blocked"
export type FundingSource = "upwork-escrow" | "retainer" | "invoice" | "prepaid"

export interface Story {
  id: string
  title: string
  status: StoryStatus
  notes?: string
  outputUrl?: string
  specUrl?: string
  createdAt: string
  completedAt?: string
}

export interface Milestone {
  id: string
  projectId: string
  title: string
  description?: string
  status: MilestoneStatus
  amount: number
  fundingSource: FundingSource
  fundingStatus: "funded" | "pending" | "partial"
  deliverables: string[]
  completionCriteria?: string
  stories: Story[]
  dueDate?: string
  createdAt: string
  completedAt?: string
  order: number
}

export interface MilestoneProject {
  id: string
  clientName: string
  projectName: string
  milestones: Milestone[]
}

export function getMilestoneProgress(milestone: Milestone): number {
  if (milestone.stories.length === 0) return 0
  const done = milestone.stories.filter((s) => s.status === "done").length
  return Math.round((done / milestone.stories.length) * 100)
}

export function getProjectProgress(project: MilestoneProject): number {
  if (project.milestones.length === 0) return 0
  const completed = project.milestones.filter((m) => m.status === "completed").length
  return Math.round((completed / project.milestones.length) * 100)
}

export function getTotalFunded(project: MilestoneProject): number {
  return project.milestones
    .filter((m) => m.fundingStatus === "funded")
    .reduce((sum, m) => sum + m.amount, 0)
}

export function getTotalSpent(project: MilestoneProject): number {
  return project.milestones
    .filter((m) => m.status === "completed")
    .reduce((sum, m) => sum + m.amount, 0)
}
