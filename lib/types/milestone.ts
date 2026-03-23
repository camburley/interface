export type MilestoneStatus = "draft" | "active" | "completed" | "on-hold"
export type StoryStatus = "todo" | "in-progress" | "review" | "done" | "blocked"
export type FundingSource = "upwork-escrow" | "retainer" | "invoice" | "prepaid" | "self-funded"
export type BoardType = "client" | "internal" | "ops"

export interface StoryAttachment {
  type: "screenshot" | "loom" | "url"
  url: string
  label?: string
  addedAt: string
}

export interface Story {
  id: string
  title: string
  status: StoryStatus
  kind?: "bug" | "feature" | "note"
  placeholder?: boolean
  notes?: string
  outputUrl?: string
  specUrl?: string
  attachments?: StoryAttachment[]
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
  includeInTotals?: boolean
  kind?: "bug" | "feature" | "note"
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
  boardType: BoardType
  milestones: Milestone[]
}

export function isCountedMilestone(milestone: Milestone): boolean {
  return milestone.includeInTotals !== false
}

export function getMilestoneProgress(milestone: Milestone): number {
  if (milestone.stories.length === 0) return 0
  const done = milestone.stories.filter((s) => s.status === "done").length
  return Math.round((done / milestone.stories.length) * 100)
}

export function getProjectProgress(project: MilestoneProject): number {
  const countedMilestones = project.milestones.filter(isCountedMilestone)
  if (countedMilestones.length === 0) return 0
  const completed = countedMilestones.filter((m) => m.status === "completed").length
  return Math.round((completed / countedMilestones.length) * 100)
}

export function getTotalFunded(project: MilestoneProject): number {
  return project.milestones
    .filter(isCountedMilestone)
    .filter((m) => m.fundingStatus === "funded")
    .reduce((sum, m) => sum + m.amount, 0)
}

export function getTotalSpent(project: MilestoneProject): number {
  return project.milestones
    .filter(isCountedMilestone)
    .filter((m) => m.status === "completed")
    .reduce((sum, m) => sum + m.amount, 0)
}
