import type { Task, TaskStatus } from "@/lib/types/task"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { getPRDetailsFromUrl, type PullRequestDetails } from "@/lib/github"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://burley.ai"

export const WEEKLY_TIMELINE_NOTE =
  "Task-based cadence. Up to 48hrs per task. Fluid based on priorities."

export interface WeeklyReportWeekRange {
  week: string
  start: string
  end: string
  startDate: Date
  endDate: Date
  label: string
}

export interface WeeklyReportArtifactLink {
  type: string
  url: string
  label: string
}

export interface WeeklyReportVideo {
  url: string
  label: string
  embedUrl: string | null
}

export interface WeeklyCompletedTask {
  id: string
  taskId: string
  title: string
  dateCompleted: string | null
  completedAt: string | null
  prUrl: string | null
  prTitle: string | null
  whatWasDone: string
  oneLineSummary: string
  video: WeeklyReportVideo | null
  links: WeeklyReportArtifactLink[]
}

export interface WeeklyReportProgress {
  done: number
  total: number
  percentage: number
  activeMilestoneCount: number
  allTimeDone: number
  allTimeTotal: number
  allTimePercentage: number
  newTasksThisWeek: number
  avgDaysPerTask: number | null
  daysSinceStart: number | null
  startDate: string | null
}

export interface WeeklyReportPayload {
  week: string
  weekRangeLabel: string
  weekStart: string
  weekEnd: string
  generatedAt: string
  projectName: string
  clientName: string
  reportUrl: string
  timelineNote: string
  completed: WeeklyCompletedTask[]
  progress: WeeklyReportProgress
  blocked: Array<{ id: string; taskId: string; title: string; reason: string }>
  upNext: Array<{ id: string; taskId: string; title: string; priority: string }>
  statusCounts: Record<TaskStatus, number>
}

const TASK_STATUS_ORDER: TaskStatus[] = [
  "backlog",
  "todo",
  "in_progress",
  "review",
  "qa",
  "done",
  "blocked",
]

function makeEmptyStatusCounts(): Record<TaskStatus, number> {
  return {
    backlog: 0,
    todo: 0,
    in_progress: 0,
    review: 0,
    qa: 0,
    done: 0,
    blocked: 0,
  }
}

function toIsoWeek(date: Date): { year: number; week: number } {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return { year: utc.getUTCFullYear(), week }
}

function isoWeekToWeekStart(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Day = jan4.getUTCDay() || 7
  const mondayWeek1 = new Date(jan4)
  mondayWeek1.setUTCDate(jan4.getUTCDate() - jan4Day + 1)
  const weekStart = new Date(mondayWeek1)
  weekStart.setUTCDate(mondayWeek1.getUTCDate() + (week - 1) * 7)
  return weekStart
}

export function getDefaultWeekParam(): string {
  const now = new Date()
  const iso = toIsoWeek(now)
  return `${iso.year}-W${String(iso.week).padStart(2, "0")}`
}

export function parseWeekRange(weekParam?: string | null): WeeklyReportWeekRange {
  const fallback = getDefaultWeekParam()
  const raw = weekParam?.trim() || fallback
  const match = raw.match(/^(\d{4})-W(\d{2})$/)

  let year: number
  let week: number
  if (!match) {
    const current = toIsoWeek(new Date())
    year = current.year
    week = current.week
  } else {
    year = Number.parseInt(match[1], 10)
    week = Number.parseInt(match[2], 10)
  }

  const monday = isoWeekToWeekStart(year, week)
  const friday = new Date(monday)
  friday.setUTCDate(monday.getUTCDate() + 4)
  friday.setUTCHours(23, 59, 59, 999)

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })

  const startLabel = formatter.format(monday)
  const endLabel = formatter.format(friday)

  return {
    week: `${year}-W${String(week).padStart(2, "0")}`,
    start: monday.toISOString(),
    end: friday.toISOString(),
    startDate: monday,
    endDate: friday,
    label: `${startLabel} - ${endLabel}`,
  }
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim()
}

function stripMarkdown(value: string): string {
  return value
    .replace(/<!--[\s\S]*?-->/g, "") // strip HTML comments (e.g. CURSOR_AGENT_PR_BODY markers)
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\|[^|\n]*\|/g, "") // strip markdown table rows
    .replace(/^\s*[-|:]+\s*$/gm, "") // strip table separator lines
}

function firstSentence(value: string): string {
  const compact = normalizeWhitespace(stripMarkdown(value)).replace(/\s+/g, " ").trim()
  if (!compact) return ""
  const sentenceMatch = compact.match(/^(.{1,220}?[.!?])\s/)
  if (sentenceMatch) return sentenceMatch[1]
  return compact.slice(0, 220)
}

function splitParagraphs(text: string): string[] {
  return normalizeWhitespace(text)
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function buildWhatWasDone(
  task: Task,
  pr: PullRequestDetails | null,
): { whatWasDone: string; oneLineSummary: string; prTitle: string | null } {
  const sections: string[] = []

  const prBody = normalizeWhitespace(stripMarkdown(pr?.body ?? ""))
  if (prBody) {
    const topSections = splitParagraphs(prBody).slice(0, 3)
    if (topSections.length > 0) {
      sections.push(`PR summary:\n${topSections.join("\n\n")}`)
    }
  }

  if ((pr?.comments.length ?? 0) > 0) {
    sections.push(
      `Client-impact notes:\n${pr!.comments
        .slice(0, 3)
        .map((comment) => `• ${firstSentence(comment)}`)
        .join("\n")}`,
    )
  }

  if ((pr?.reviewComments.length ?? 0) > 0) {
    sections.push(
      `Review details:\n${pr!.reviewComments
        .slice(0, 3)
        .map((comment) => `• ${firstSentence(comment)}`)
        .join("\n")}`,
    )
  }

  if ((pr?.commitMessages.length ?? 0) > 0) {
    sections.push(
      `Commits:\n${pr!.commitMessages
        .slice(0, 5)
        .map((message) => `• ${firstSentence(message)}`)
        .join("\n")}`,
    )
  }

  const fallback = firstSentence(task.clientDescription || task.description || task.title)
  const oneLineSummary =
    firstSentence(pr?.body ?? "") || firstSentence(pr?.title ?? "") || fallback || task.title

  return {
    whatWasDone: sections.join("\n\n").trim() || fallback || task.title,
    oneLineSummary,
    prTitle: pr?.title ?? null,
  }
}

function pickVideo(task: Task): WeeklyReportVideo | null {
  const artifacts = task.artifacts ?? []
  // Check "loom" type first
  const loom = artifacts.find((artifact) => artifact.type === "loom")
  if (loom) {
    return {
      url: loom.url,
      label: loom.label || "Loom demo",
      embedUrl: toLoomEmbedUrl(loom.url),
    }
  }

  // Check "video" type (used by cursor-agent artifacts)
  const video = artifacts.find((artifact) => artifact.type === "video")
  if (video) {
    return {
      url: video.url,
      label: video.label || "Demo video",
      embedUrl: toLoomEmbedUrl(video.url),
    }
  }

  const possible = artifacts.find((artifact) => {
    if (artifact.type !== "url") return false
    const url = artifact.url.toLowerCase()
    return (
      url.includes("loom.com") ||
      url.endsWith(".mp4") ||
      url.endsWith(".webm") ||
      url.endsWith(".mov")
    )
  })

  if (!possible) return null
  return {
    url: possible.url,
    label: possible.label || "Demo video",
    embedUrl: toLoomEmbedUrl(possible.url),
  }
}

export function toLoomEmbedUrl(url: string): string | null {
  const match = url.match(/https?:\/\/www\.loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/)
  if (!match) return null
  return `https://www.loom.com/embed/${match[1]}`
}

function pickPrUrl(task: Task): string | null {
  const artifacts = task.artifacts ?? []
  const artifact = artifacts.find((entry) => entry.type === "github_pr")
  return artifact?.url ?? null
}

function pickLinks(task: Task): WeeklyReportArtifactLink[] {
  const links = (task.artifacts ?? [])
    .filter((artifact) => artifact.type === "url" || artifact.type === "github_pr")
    .map((artifact) => ({
      type: artifact.type,
      url: artifact.url,
      label: artifact.label || (artifact.type === "github_pr" ? "Pull request" : "Link"),
    }))

  if (task.outputUrl) {
    const lower = task.outputUrl.toLowerCase()
    // Don't add if it's a loom/video URL — those are handled by pickVideo
    if (!lower.includes('loom.com') && !lower.endsWith('.mp4') && !lower.endsWith('.webm') && !lower.endsWith('.mov')) {
      links.push({
        type: "deploy",
        url: task.outputUrl,
        label: "Deploy preview",
      })
    }
  }

  return links
}

function sortByPositionThenCreated(a: Task, b: Task): number {
  const aPos = a.position ?? 99999
  const bPos = b.position ?? 99999
  if (aPos !== bPos) return aPos - bPos
  const aCreated = Date.parse(a.createdAt || "")
  const bCreated = Date.parse(b.createdAt || "")
  if (Number.isNaN(aCreated) || Number.isNaN(bCreated)) return 0
  return aCreated - bCreated
}

export async function buildWeeklyReportForClient(input: {
  clientId: string
  projectId: string
  clientName?: string
  week?: string | null
}): Promise<WeeklyReportPayload> {
  const { db } = getFirebaseAdmin()
  const range = parseWeekRange(input.week)

  const [tasksSnap, clientDoc, projectDoc, milestonesSnap] = await Promise.all([
    db.collection("tasks").where("projectId", "==", input.projectId).get(),
    db.collection("clients").doc(input.clientId).get(),
    db.collection("milestone_projects").doc(input.projectId).get(),
    db.collection("milestones").where("projectId", "==", input.projectId).get(),
  ])

  const tasks = tasksSnap.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Task,
  )

  tasks.sort(sortByPositionThenCreated)

  const statusCounts = makeEmptyStatusCounts()
  for (const task of tasks) {
    if (TASK_STATUS_ORDER.includes(task.status)) {
      statusCounts[task.status] += 1
    }
  }

  const activeMilestoneIds = new Set(
    milestonesSnap.docs
      .map((doc) => ({ id: doc.id, status: doc.data().status as string }))
      .filter((milestone) => milestone.status === "active")
      .map((milestone) => milestone.id),
  )

  const completedThisWeek = tasks.filter((task) => {
    if (!task.completedAt || task.status !== "done") return false
    const completedAt = Date.parse(task.completedAt)
    if (Number.isNaN(completedAt)) return false
    return completedAt >= range.startDate.getTime() && completedAt <= range.endDate.getTime()
  })

  // Scope progress to CURRENT work: exclude tasks completed before this week.
  // "Remaining" = todo + in_progress + review + qa + blocked.
  // "Done this period" = tasks completed within the week range.
  // This prevents old completed tasks from inflating the progress bar.
  const remaining = tasks.filter((task) =>
    ["todo", "in_progress", "review", "qa", "blocked"].includes(task.status)
  )
  const doneThisWeek = completedThisWeek.length
  const progressTotal = doneThisWeek + remaining.length
  const progressDone = doneThisWeek
  const progressPercentage =
    progressTotal > 0 ? Math.round((progressDone / progressTotal) * 100) : 0

  const completed = await Promise.all(
    completedThisWeek.map(async (task) => {
      const prUrl = pickPrUrl(task)
      const pr = prUrl ? await getPRDetailsFromUrl(prUrl) : null
      const description = buildWhatWasDone(task, pr)

      return {
        id: task.id,
        taskId: task.taskId,
        title: task.title,
        dateCompleted: task.completedAt
          ? new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date(task.completedAt))
          : null,
        completedAt: task.completedAt ?? null,
        prUrl,
        prTitle: description.prTitle,
        whatWasDone: description.whatWasDone,
        oneLineSummary: description.oneLineSummary,
        video: pickVideo(task),
        links: pickLinks(task),
      } as WeeklyCompletedTask
    }),
  )

  const blocked = tasks
    .filter((task) => task.status === "blocked")
    .map((task) => ({
      id: task.id,
      taskId: task.taskId,
      title: task.title,
      reason: task.blockedReason?.trim() || "No reason specified",
    }))

  // Count tasks created this week
  const newTasksThisWeek = tasks.filter((task) => {
    const created = Date.parse(task.createdAt || "")
    if (Number.isNaN(created)) return false
    return created >= range.startDate.getTime() && created <= range.endDate.getTime()
  }).length

  // All-time progress
  const allTimeDone = tasks.filter((t) => t.status === "done").length
  const allTimeTotal = tasks.length
  const allTimePercentage = allTimeTotal > 0 ? Math.round((allTimeDone / allTimeTotal) * 100) : 0

  // Avg days per task (using first completedAt to now)
  const allCompletedDates = tasks
    .filter((t) => t.status === "done" && t.completedAt)
    .map((t) => Date.parse(t.completedAt!))
    .filter((d) => !Number.isNaN(d))
    .sort((a, b) => a - b)

  // Find project start (earliest createdAt from Stripe sub or first task)
  const clientData = clientDoc.exists ? clientDoc.data() : null
  const stripeStart = clientData?.subscriptionStartDate ? Date.parse(clientData.subscriptionStartDate as string) : NaN
  const earliestTask = tasks.map((t) => Date.parse(t.createdAt || "")).filter((d) => !Number.isNaN(d)).sort((a, b) => a - b)[0]
  const projectStart = !Number.isNaN(stripeStart) ? stripeStart : earliestTask || NaN
  const daysSinceStart = !Number.isNaN(projectStart) ? Math.ceil((Date.now() - projectStart) / 86400000) : null
  const avgDaysPerTask = allTimeDone > 0 && daysSinceStart ? Math.round((daysSinceStart / allTimeDone) * 10) / 10 : null
  const startDateStr = !Number.isNaN(projectStart) ? new Date(projectStart).toISOString().slice(0, 10) : null

  const upNext = tasks
    .filter((task) => task.status === "todo")
    .sort(sortByPositionThenCreated)
    .slice(0, 5)
    .map((task) => ({
      id: task.id,
      taskId: task.taskId,
      title: task.title,
      priority: task.priority,
    }))

  const clientNameFromDoc = clientDoc.exists ? (clientDoc.data()?.name as string | undefined) : undefined
  const projectNameFromDoc = projectDoc.exists
    ? ((projectDoc.data()?.projectName as string | undefined) ?? "Project")
    : "Project"

  return {
    week: range.week,
    weekRangeLabel: range.label,
    weekStart: range.start,
    weekEnd: range.end,
    generatedAt: new Date().toISOString(),
    projectName: projectNameFromDoc,
    clientName: input.clientName || clientNameFromDoc || "Client",
    reportUrl: `${BASE_URL}/client/reports/weekly?week=${encodeURIComponent(range.week)}`,
    timelineNote: WEEKLY_TIMELINE_NOTE,
    completed,
    progress: {
      done: progressDone,
      total: progressTotal,
      percentage: progressPercentage,
      activeMilestoneCount: activeMilestoneIds.size,
      allTimeDone,
      allTimeTotal,
      allTimePercentage,
      newTasksThisWeek,
      avgDaysPerTask,
      daysSinceStart,
      startDate: startDateStr,
    },
    blocked,
    upNext,
    statusCounts,
  }
}
