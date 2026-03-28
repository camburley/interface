export type TaskStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "review"
  | "qa"
  | "done"
  | "blocked"

export type TaskPriority = "low" | "medium" | "high" | "urgent"

export type CardType = "one_off" | "recurring" | "standing"

export type RecurrenceFrequency =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"

export interface CompletionEntry {
  completedAt: string
  actor: string
  comment: string
  cycleNumber: number
}

export interface Recurrence {
  frequency: RecurrenceFrequency
  nextDue: string | null
  lastCompleted: string | null
  streak: number
  completionLog: CompletionEntry[]
  todayCount: number
  targetCount: number | null
  lastReset: string | null
}

export type TaskRelation =
  | "parent"
  | "child"
  | "blocked_by"
  | "blocks"
  | "related_to"
  | "duplicates"
  | "spawned_from"
  | "validates"

export type ArtifactType =
  | "github_pr"
  | "figma"
  | "loom"
  | "screenshot"
  | "url"
  | "document"
  | "test_report"
  | "slack_thread"
  | "file"

export interface TaskArtifact {
  type: ArtifactType
  url: string
  label?: string
  addedAt: string
  addedBy?: string
}

export interface TaskContext {
  repo?: string
  service?: string
  files?: string[]
  relevantDocs?: string[]
  recentDecisions?: string[]
  knownRisks?: string[]
  openQuestions?: string[]
}

export interface TaskHistoryEntry {
  id: string
  timestamp: string
  actor: string
  event: string
  details?: Record<string, unknown>
  inputs?: string[]
  confidence?: number
}

export interface Task {
  id: string
  taskId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  milestoneId?: string
  storyId?: string
  parentTaskId?: string
  dependencies: string[]
  assignee?: string
  owner?: string
  tags: string[]
  hours?: number
  acceptanceCriteria: string[]
  definitionOfDone: string[]
  artifacts: TaskArtifact[]
  context: TaskContext
  specUrl?: string
  outputUrl?: string
  dueDate?: string
  sprint?: string
  cardType: CardType
  recurrence?: Recurrence
  position?: number
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; className: string; columnOrder: number }
> = {
  backlog: {
    label: "Backlog",
    className: "text-muted-foreground bg-muted/30 border-border",
    columnOrder: 0,
  },
  todo: {
    label: "To Do",
    className: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    columnOrder: 1,
  },
  in_progress: {
    label: "In Progress",
    className: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    columnOrder: 2,
  },
  review: {
    label: "Review",
    className: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    columnOrder: 3,
  },
  qa: {
    label: "QA",
    className: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    columnOrder: 4,
  },
  done: {
    label: "Done",
    className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    columnOrder: 5,
  },
  blocked: {
    label: "Blocked",
    className: "text-red-400 bg-red-400/10 border-red-400/20",
    columnOrder: 6,
  },
}

export const TASK_PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; className: string; sortOrder: number }
> = {
  low: {
    label: "Low",
    className: "bg-muted text-muted-foreground",
    sortOrder: 0,
  },
  medium: {
    label: "Medium",
    className: "bg-blue-500/20 text-blue-400",
    sortOrder: 1,
  },
  high: {
    label: "High",
    className: "bg-amber-500/20 text-amber-400",
    sortOrder: 2,
  },
  urgent: {
    label: "Urgent",
    className: "bg-red-500/20 text-red-400",
    sortOrder: 3,
  },
}

export const BOARD_COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "qa", title: "QA" },
  { id: "done", title: "Done" },
  { id: "blocked", title: "Blocked" },
]

export interface BoardProject {
  id: string
  name: string
  color: string
  clientName: string
  boardType: "client" | "internal" | "ops"
}

export const CARD_TYPE_CONFIG: Record<
  CardType,
  { label: string; icon: string; className: string }
> = {
  one_off: {
    label: "One-off",
    icon: "",
    className: "",
  },
  recurring: {
    label: "Recurring",
    icon: "🔄",
    className: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  },
  standing: {
    label: "Standing",
    icon: "📌",
    className: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  },
}

export const RECURRENCE_FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
}

export function computeNextDue(frequency: RecurrenceFrequency, from?: Date): string {
  const base = from ?? new Date()
  const next = new Date(base)
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1)
      break
    case "weekly":
      next.setDate(next.getDate() + 7)
      break
    case "biweekly":
      next.setDate(next.getDate() + 14)
      break
    case "monthly":
      next.setMonth(next.getMonth() + 1)
      break
    case "quarterly":
      next.setMonth(next.getMonth() + 3)
      break
  }
  return next.toISOString()
}

export const PROJECT_COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#f97316",
] as const
