"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  Activity,
  LayoutGrid,
} from "lucide-react"
import type { TrackerProject, TrackerMilestone } from "@/lib/stores/project-store"
import { useProjectStore } from "@/lib/stores/project-store"

type ProjectStatus = "on-track" | "warning" | "off-track" | "completed"

const STATUS_COLORS: Record<ProjectStatus, string> = {
  "on-track": "bg-emerald-500",
  warning: "bg-amber-500",
  "off-track": "bg-red-500",
  completed: "bg-muted",
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  "on-track": "On Track",
  warning: "Warning",
  "off-track": "Off Track",
  completed: "Completed",
}

type ProgressStep = "scoped" | "designed" | "building" | "review" | "deployed" | "done"

const PROGRESS_STEPS: { id: ProgressStep; label: string; abbrev: string }[] = [
  { id: "scoped", label: "Scoped", abbrev: "SC" },
  { id: "designed", label: "Designed", abbrev: "DS" },
  { id: "building", label: "Building", abbrev: "BL" },
  { id: "review", label: "Review", abbrev: "RV" },
  { id: "deployed", label: "Deployed", abbrev: "DP" },
  { id: "done", label: "Done", abbrev: "DN" },
]

const SERVICE_COLORS: Record<string, string> = {
  retainer: "bg-emerald-500/20 text-emerald-400",
  sprint: "bg-blue-500/20 text-blue-400",
  hourly: "bg-purple-500/20 text-purple-400",
  fixed: "bg-amber-500/20 text-amber-400",
}

interface Props {
  initialProjects: TrackerProject[]
}

function deriveStatus(project: TrackerProject): ProjectStatus {
  const { milestones, taskCounts } = project
  const allCompleted = milestones.length > 0 && milestones.every((m) => m.status === "completed")
  if (allCompleted) return "completed"
  if (taskCounts.blocked > 0) return "off-track"
  if (taskCounts.inProgress === 0 && taskCounts.total > 0 && taskCounts.done < taskCounts.total) return "warning"
  return "on-track"
}

function deriveProgressStep(project: TrackerProject): {
  currentStep: ProgressStep
  completedSteps: ProgressStep[]
} {
  const { milestones, taskCounts } = project
  const totalMilestones = milestones.length
  const completedMilestones = milestones.filter((m) => m.status === "completed").length
  const activeMilestones = milestones.filter((m) => m.status === "active").length
  const ratio = totalMilestones > 0 ? completedMilestones / totalMilestones : 0

  if (ratio >= 1) {
    return { currentStep: "done", completedSteps: ["scoped", "designed", "building", "review", "deployed", "done"] }
  }
  if (ratio >= 0.8) {
    return { currentStep: "deployed", completedSteps: ["scoped", "designed", "building", "review"] }
  }
  if (taskCounts.total > 0 && taskCounts.done > 0) {
    return { currentStep: "review", completedSteps: ["scoped", "designed", "building"] }
  }
  if (taskCounts.inProgress > 0 || activeMilestones > 0) {
    return { currentStep: "building", completedSteps: ["scoped", "designed"] }
  }
  if (totalMilestones > 0) {
    return { currentStep: "designed", completedSteps: ["scoped"] }
  }
  return { currentStep: "scoped", completedSteps: [] }
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return "—"
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`
}

export function TrackerClient({ initialProjects }: Props) {
  const [projects, setProjects] = useState(initialProjects)
  const [search, setSearch] = useState("")
  const [activeExpanded, setActiveExpanded] = useState(true)
  const [completedExpanded, setCompletedExpanded] = useState(false)
  const [selectedProject, setSelectedProject] = useState<TrackerProject | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const filtered = projects.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.clientName.toLowerCase().includes(q) ||
      p.projectName.toLowerCase().includes(q)
    )
  })

  const active = filtered.filter((p) => deriveStatus(p) !== "completed")
  const completed = filtered.filter((p) => deriveStatus(p) === "completed")

  const offTrack = projects.filter((p) => deriveStatus(p) === "off-track").length
  const warning = projects.filter((p) => deriveStatus(p) === "warning").length
  const onTrack = projects.filter((p) => deriveStatus(p) === "on-track").length

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const res = await fetch("/api/admin/tasks/projects")
      if (res.ok) {
        const data = await res.json()
        setProjects(data.projects)
      }
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 sticky top-0 z-10 backdrop-blur-sm bg-background/80">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bebas text-2xl tracking-tight">Burley</span>
            <span className="font-mono text-xs text-muted-foreground border border-border/50 rounded-sm px-2 py-0.5 bg-primary/10 text-primary">
              Admin
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              <Activity className="inline h-3.5 w-3.5 mr-1" />
              Tracker
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/board"
              className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Board
            </Link>
            <Link
              href="/admin"
              className="font-mono text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Admin
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Summary bar */}
        <div className="flex items-center gap-6 mb-6 font-mono text-xs">
          {offTrack > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-red-400">{offTrack} off-track</span>
            </div>
          )}
          {warning > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-400">{warning} warning</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-400">{onTrack} on track</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-56 bg-muted/20 border border-border/50 rounded-sm pl-9 pr-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Active section */}
        <div className="mb-6">
          <button
            onClick={() => setActiveExpanded(!activeExpanded)}
            className="flex items-center gap-2 mb-3 font-mono text-xs text-foreground uppercase tracking-widest"
          >
            {activeExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            Active ({active.length})
          </button>

          {activeExpanded && (
            <div className="border border-border/40 rounded-sm divide-y divide-border/20">
              {active.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
              {active.length === 0 && (
                <div className="p-8 text-center">
                  <p className="font-mono text-xs text-muted-foreground">
                    No active projects
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Completed section */}
        <div>
          <button
            onClick={() => setCompletedExpanded(!completedExpanded)}
            className="flex items-center gap-2 mb-3 font-mono text-xs text-muted-foreground uppercase tracking-widest"
          >
            {completedExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            Completed ({completed.length})
          </button>

          {completedExpanded && (
            <div className="border border-border/40 rounded-sm divide-y divide-border/20">
              {completed.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
              {completed.length === 0 && (
                <div className="p-8 text-center">
                  <p className="font-mono text-xs text-muted-foreground">
                    No completed projects
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedProject && (
        <DetailPanel
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  )
}

function ProjectRow({
  project,
  onClick,
}: {
  project: TrackerProject
  onClick: () => void
}) {
  const status = deriveStatus(project)
  const { currentStep, completedSteps } = deriveProgressStep(project)

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/10 transition-colors group"
    >
      {/* Status dot */}
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_COLORS[status]}`} />

      {/* Client */}
      <div className="w-32 shrink-0">
        <p className="font-mono text-xs text-foreground truncate">
          {project.clientName}
        </p>
      </div>

      {/* Project name */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs text-foreground truncate group-hover:text-primary transition-colors">
          {project.projectName}
        </p>
      </div>

      {/* Status label */}
      <span
        className={`font-mono text-[10px] uppercase tracking-widest shrink-0 ${
          status === "on-track"
            ? "text-emerald-400"
            : status === "warning"
              ? "text-amber-400"
              : status === "off-track"
                ? "text-red-400"
                : "text-muted-foreground"
        }`}
      >
        {STATUS_LABELS[status]}
      </span>

      {/* Progress stepper */}
      <div className="flex items-center gap-1 shrink-0">
        {PROGRESS_STEPS.map((step, idx) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = currentStep === step.id

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono ${
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3" /> : step.abbrev}
              </div>
              {idx < PROGRESS_STEPS.length - 1 && (
                <div
                  className={`w-2 h-0.5 ${
                    isCompleted ? "bg-emerald-500" : "bg-muted"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Last activity */}
      <span className="font-mono text-[10px] text-muted-foreground shrink-0 w-16 text-right">
        {formatRelativeTime(project.lastActivity)}
      </span>
    </button>
  )
}

function DetailPanel({
  project,
  onClose,
}: {
  project: TrackerProject
  onClose: () => void
}) {
  const status = deriveStatus(project)
  const { currentStep, completedSteps } = deriveProgressStep(project)
  const completedAmount = project.completed ?? project.milestones
    .filter((m) => m.status === "completed")
    .reduce((s, m) => s + m.amount, 0)
  const completedMilestoneCount = project.completedMilestoneCount ?? project.milestones.filter(
    (m) => m.status === "completed",
  ).length

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-background border-l border-border/40 z-50 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs text-muted-foreground">
              {project.clientName}
            </p>
            <h2 className="text-xl font-bold text-foreground mt-1">
              {project.projectName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status]}`}
          />
          <span className="font-mono text-xs text-foreground uppercase tracking-widest">
            {STATUS_LABELS[status]}
          </span>
        </div>

        {/* Budget overview cards — matches milestones page */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-border/50 rounded-sm p-4 space-y-1">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Total Budget
            </p>
            <p className="font-mono text-2xl font-bold text-foreground">
              {formatCurrency(project.totalBudget)}
            </p>
          </div>
          <div className="border border-border/50 rounded-sm p-4 space-y-1">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Funded
            </p>
            <p className={`font-mono text-2xl font-bold ${project.funded > 0 ? "text-emerald-400" : "text-foreground"}`}>
              {formatCurrency(project.funded)}
            </p>
          </div>
          <div className="border border-border/50 rounded-sm p-4 space-y-1">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Completed
            </p>
            <p className={`font-mono text-2xl font-bold ${completedAmount > 0 ? "text-emerald-400" : "text-foreground"}`}>
              {formatCurrency(completedAmount)}
            </p>
          </div>
          <div className="border border-border/50 rounded-sm p-4 space-y-1">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Milestones
            </p>
            <p className="font-mono text-2xl font-bold text-foreground">
              {completedMilestoneCount} / {project.milestones.length}
            </p>
          </div>
        </div>

        {/* Budget progress bar */}
        <div className="border border-border/40 rounded-sm p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Budget Progress
            </p>
            <p className="font-mono text-xs text-foreground">
              {project.totalBudget > 0 ? Math.round((completedAmount / project.totalBudget) * 100) : 0}%
            </p>
          </div>
          <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all"
              style={{
                width: `${project.totalBudget > 0 ? Math.round((completedAmount / project.totalBudget) * 100) : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Progress timeline (full) */}
        <div className="border border-border/40 rounded-sm p-4 space-y-3">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            Progress
          </p>
          <div className="flex items-center justify-between gap-2">
            {PROGRESS_STEPS.map((step, idx) => {
              const isCompleted = completedSteps.includes(step.id)
              const isCurrent = currentStep === step.id

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-[10px] ${
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : step.abbrev}
                    </div>
                    <span
                      className={`font-mono text-[9px] ${
                        isCompleted || isCurrent
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < PROGRESS_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 ${
                        isCompleted ? "bg-emerald-500" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Task counts */}
        <div className="border border-border/40 rounded-sm p-4 space-y-3">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            Tasks
          </p>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <p className="font-mono text-lg font-bold text-foreground">
                {project.taskCounts.total}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                Total
              </p>
            </div>
            <div>
              <p className="font-mono text-lg font-bold text-emerald-400">
                {project.taskCounts.done}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                Done
              </p>
            </div>
            <div>
              <p className="font-mono text-lg font-bold text-amber-400">
                {project.taskCounts.inProgress}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                Active
              </p>
            </div>
            <div>
              <p className="font-mono text-lg font-bold text-red-400">
                {project.taskCounts.blocked}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                Blocked
              </p>
            </div>
          </div>
        </div>

        {/* Milestones list */}
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            Milestones ({project.milestones.length})
          </p>
          {project.milestones.map((ms) => (
            <MilestoneRow key={ms.id} milestone={ms} />
          ))}
        </div>

        {/* Quick links */}
        <div className="flex items-center gap-3 pt-2 border-t border-border/30">
          <Link
            href={`/admin/projects/${project.id}/milestones`}
            className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Milestones
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href={`/admin/board?project=${project.id}`}
            className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Board
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function MilestoneRow({ milestone }: { milestone: TrackerMilestone }) {
  const statusColor =
    milestone.status === "completed"
      ? "text-emerald-400"
      : milestone.status === "active"
        ? "text-blue-400"
        : milestone.status === "on-hold"
          ? "text-amber-400"
          : "text-muted-foreground"

  const progress =
    milestone.storyCount > 0
      ? Math.round(
          (milestone.completedStoryCount / milestone.storyCount) * 100,
        )
      : 0

  return (
    <div className="border border-border/30 rounded-sm p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[10px] text-muted-foreground shrink-0">
            M{milestone.order + 1}
          </span>
          <span className="font-mono text-xs text-foreground truncate">
            {milestone.title}
          </span>
        </div>
        <span
          className={`font-mono text-[10px] uppercase tracking-widest shrink-0 ${statusColor}`}
        >
          {milestone.status}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1 h-1 bg-muted/40 rounded-full overflow-hidden mr-3">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground shrink-0">
          {milestone.completedStoryCount}/{milestone.storyCount} · {formatCurrency(milestone.amount)}
        </span>
      </div>
    </div>
  )
}
