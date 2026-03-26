"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Plus,
  Search,
  GripVertical,
  ExternalLink,
  FileText,
  LayoutGrid,
  ArrowLeft,
  X,
  Clock,
  AlertTriangle,
  CheckCircle,
  Briefcase,
  Rocket,
  Settings,
  Flame,
  Pin,
  RefreshCw,
  Timer,
  MessageSquare,
} from "lucide-react"
import { toast } from "sonner"
import { useTaskStore } from "@/lib/stores/task-store"
import {
  BOARD_COLUMNS,
  TASK_PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
  CARD_TYPE_CONFIG,
  RECURRENCE_FREQUENCY_LABELS,
} from "@/lib/types/task"
import type {
  Task,
  TaskStatus,
  TaskPriority,
  BoardProject,
  CardType,
  RecurrenceFrequency,
  TaskHistoryEntry,
} from "@/lib/types/task"

type BoardType = "client" | "internal" | "ops"

const BOARD_TABS: { id: BoardType; label: string; icon: typeof Briefcase }[] = [
  { id: "client", label: "Clients", icon: Briefcase },
  { id: "internal", label: "Products", icon: Rocket },
  { id: "ops", label: "Operations", icon: Settings },
]

interface Props {
  initialTasks: Task[]
  projects: BoardProject[]
}

export function BoardClient({ initialTasks, projects }: Props) {
  const {
    tasks,
    filters,
    setFilters,
    moveTask,
    createTask,
    deleteTask,
    filteredTasks,
    fetchTasks,
  } = useTaskStore()

  const searchParams = useSearchParams()
  const router = useRouter()
  const activeBoardType = (searchParams.get("type") as BoardType) || "client"

  const setActiveBoardType = useCallback(
    (type: BoardType) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("type", type)
      router.replace(`/admin/board?${params.toString()}`)
      setFilters({ projectId: undefined })
    },
    [searchParams, router, setFilters],
  )

  // Filter projects by active board type
  const boardProjects = projects.filter(
    (p) => (p.boardType ?? "client") === activeBoardType,
  )

  // Project IDs for the active board
  const boardProjectIds = new Set(boardProjects.map((p) => p.id))

  const [initialized, setInitialized] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [completionModal, setCompletionModal] = useState<{
    taskId: string
    taskTitle: string
  } | null>(null)
  const [completionComment, setCompletionComment] = useState("")
  const [completing, setCompleting] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    projectId: boardProjects[0]?.id ?? "",
    priority: "medium" as TaskPriority,
    status: "backlog" as TaskStatus,
    tags: "",
    hours: "",
    description: "",
    cardType: "one_off" as CardType,
    recurrenceFrequency: "daily" as RecurrenceFrequency,
    targetCount: "",
  })

  useEffect(() => {
    useTaskStore.setState({ tasks: initialTasks })
    if (!initialized) setInitialized(true)
  }, [initialTasks, initialized])

  // Always refetch on mount so board shows latest after navigating from milestone
  useEffect(() => {
    fetchTasks(filters.projectId)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- run once on mount

  // Refetch when tab becomes visible
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchTasks(filters.projectId)
    }
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisible)
      return () => document.removeEventListener("visibilitychange", onVisible)
    }
  }, [filters.projectId, fetchTasks])

  // Reset default project when board type changes
  useEffect(() => {
    if (boardProjects.length > 0) {
      setNewTask((prev) => ({ ...prev, projectId: boardProjects[0].id }))
    }
  }, [activeBoardType]) // eslint-disable-line react-hooks/exhaustive-deps

  const allFiltered = initialized ? filteredTasks() : initialTasks
  // Scope visible tasks to the active board type
  const visible = allFiltered.filter((t) => boardProjectIds.has(t.projectId))

  const getProjectColor = useCallback(
    (projectId: string) =>
      projects.find((p) => p.id === projectId)?.color ?? "#666",
    [projects],
  )

  const getProjectName = useCallback(
    (projectId: string) =>
      projects.find((p) => p.id === projectId)?.name ?? "Unknown",
    [projects],
  )

  function handleDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData("text/plain", taskId)
    setDraggingId(taskId)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  async function handleDrop(e: React.DragEvent, newStatus: TaskStatus) {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("text/plain")
    setDraggingId(null)
    if (!taskId) return

    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return

    if (
      newStatus === "done" &&
      (task.cardType ?? "one_off") === "recurring" &&
      task.recurrence
    ) {
      setCompletionModal({ taskId: task.id, taskTitle: task.title })
      setCompletionComment("")
      return
    }

    const success = await moveTask(taskId, newStatus)
    if (!success) {
      toast.error(`Cannot move to ${TASK_STATUS_CONFIG[newStatus].label}`)
    }
  }

  async function handleCompleteRecurring() {
    if (!completionModal) return
    if (completionComment.trim().length < 10) {
      toast.error("Comment must be at least 10 characters")
      return
    }
    setCompleting(true)
    const success = await moveTask(
      completionModal.taskId,
      "done",
      "admin",
      completionComment.trim(),
    )
    setCompleting(false)
    if (success) {
      toast.success("Completed & logged")
      setCompletionModal(null)
      setCompletionComment("")
    } else {
      toast.error("Failed to complete task")
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const result = await createTask({
      title: newTask.title,
      projectId: newTask.projectId,
      priority: newTask.priority,
      status: newTask.cardType === "standing" ? "in_progress" : newTask.status,
      description: newTask.description || undefined,
      tags: newTask.tags
        ? newTask.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined,
      hours: newTask.hours ? Number(newTask.hours) : undefined,
      cardType: newTask.cardType,
      recurrenceFrequency:
        newTask.cardType === "recurring"
          ? newTask.recurrenceFrequency
          : undefined,
      targetCount:
        newTask.cardType === "recurring" && newTask.targetCount
          ? Number(newTask.targetCount)
          : undefined,
    })
    setCreating(false)

    if (result) {
      toast.success(`${result.taskId} created`)
      setNewTask({
        title: "",
        projectId: projects[0]?.id ?? "",
        priority: "medium",
        status: "backlog",
        tags: "",
        hours: "",
        description: "",
        cardType: "one_off",
        recurrenceFrequency: "daily",
        targetCount: "",
      })
      setShowCreate(false)
    } else {
      toast.error("Failed to create task")
    }
  }

  const columnTasks = (status: TaskStatus) => {
    const col = visible.filter((t) => t.status === status)
    col.sort((a, b) => {
      const aStanding = a.cardType === "standing" ? 0 : 1
      const bStanding = b.cardType === "standing" ? 0 : 1
      return aStanding - bStanding
    })
    return col
  }

  const boardScopedTasks = tasks.filter((t) => boardProjectIds.has(t.projectId))
  const totalTasks = boardScopedTasks.length
  const inProgressCount = boardScopedTasks.filter(
    (t) => t.status === "in_progress",
  ).length
  const blockedCount = boardScopedTasks.filter((t) => t.status === "blocked").length

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 sticky top-0 z-10 backdrop-blur-sm bg-background/80">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bebas text-2xl tracking-tight">Burley</span>
            <span className="font-mono text-xs text-muted-foreground border border-border/50 rounded-sm px-2 py-0.5 bg-primary/10 text-primary">
              Admin
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              <LayoutGrid className="inline h-3.5 w-3.5 mr-1" />
              Board
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/tracker"
              className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Tracker
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

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Board type tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-border/40 pb-3">
          {BOARD_TABS.map((tab) => {
            const isActive = activeBoardType === tab.id
            const Icon = tab.icon
            const tabProjects = projects.filter(
              (p) => (p.boardType ?? "client") === tab.id,
            )
            return (
              <button
                key={tab.id}
                onClick={() => setActiveBoardType(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-sm font-mono text-xs uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                <span
                  className={`text-[10px] ${
                    isActive ? "text-primary/70" : "text-muted-foreground/50"
                  }`}
                >
                  {tabProjects.length}
                </span>
              </button>
            )
          })}
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 mb-6 font-mono text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>{totalTasks} tasks</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400">
            <Clock className="h-3.5 w-3.5" />
            <span>{inProgressCount} in progress</span>
          </div>
          {blockedCount > 0 && (
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{blockedCount} blocked</span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={filters.search ?? ""}
                onChange={(e) => setFilters({ search: e.target.value || undefined })}
                placeholder="Search tasks..."
                className="w-56 bg-muted/20 border border-border/50 rounded-sm pl-9 pr-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Project filter */}
            <select
              value={filters.projectId ?? ""}
              onChange={(e) =>
                setFilters({ projectId: e.target.value || undefined })
              }
              className="bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">All Projects</option>
              {boardProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Add task */}
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-sm hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Task
            </button>
          </div>
        </div>

        {/* Create task panel */}
        {showCreate && (
          <div className="mb-6 border border-primary/30 bg-primary/5 rounded-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-xs text-primary uppercase tracking-widest">
                New Task
              </p>
              <button
                onClick={() => setShowCreate(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  Title
                </label>
                <input
                  required
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="Handle expired OAuth state token in callback endpoint..."
                  className="w-full bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  Project
                </label>
                <select
                  required
                  value={newTask.projectId}
                  onChange={(e) =>
                    setNewTask((p) => ({ ...p, projectId: e.target.value }))
                  }
                  className="w-full bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  {boardProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask((p) => ({
                      ...p,
                      priority: e.target.value as TaskPriority,
                    }))
                  }
                  className="w-full bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  Column
                </label>
                <select
                  value={newTask.status}
                  onChange={(e) =>
                    setNewTask((p) => ({
                      ...p,
                      status: e.target.value as TaskStatus,
                    }))
                  }
                  className="w-full bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  {BOARD_COLUMNS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  Card Type
                </label>
                <select
                  value={newTask.cardType}
                  onChange={(e) =>
                    setNewTask((p) => ({
                      ...p,
                      cardType: e.target.value as CardType,
                    }))
                  }
                  className="w-full bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="one_off">One-off (default)</option>
                  <option value="recurring">Recurring</option>
                  <option value="standing">Standing</option>
                </select>
              </div>
              {newTask.cardType === "recurring" && (
                <>
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                      Frequency
                    </label>
                    <select
                      value={newTask.recurrenceFrequency}
                      onChange={(e) =>
                        setNewTask((p) => ({
                          ...p,
                          recurrenceFrequency: e.target.value as RecurrenceFrequency,
                        }))
                      }
                      className="w-full bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                    >
                      {(Object.entries(RECURRENCE_FREQUENCY_LABELS) as [RecurrenceFrequency, string][]).map(
                        ([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                      Target/day (optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={newTask.targetCount}
                      onChange={(e) =>
                        setNewTask((p) => ({ ...p, targetCount: e.target.value }))
                      }
                      placeholder="e.g. 3"
                      className="w-full bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </>
              )}
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  Hours (est.)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={newTask.hours}
                  onChange={(e) =>
                    setNewTask((p) => ({ ...p, hours: e.target.value }))
                  }
                  placeholder="4"
                  className="w-full bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  Tags (comma separated)
                </label>
                <input
                  value={newTask.tags}
                  onChange={(e) =>
                    setNewTask((p) => ({ ...p, tags: e.target.value }))
                  }
                  placeholder="feature, ui, auth"
                  className="w-full bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  Description
                </label>
                <input
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Done when backend tests and Playwright flow pass."
                  className="w-full bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="md:col-span-3 flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-5 py-2.5 rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {creating ? "Creating..." : "Create Task"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Kanban board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {BOARD_COLUMNS.map((column) => {
            const colTasks = columnTasks(column.id)
            const totalHours = colTasks.reduce(
              (s, t) => s + (t.hours ?? 0),
              0,
            )

            return (
              <div
                key={column.id}
                data-column-id={column.id}
                className="flex-shrink-0 w-72"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-foreground uppercase tracking-widest">
                      {column.title}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {colTasks.length}
                    </span>
                  </div>
                  {totalHours > 0 && (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {totalHours}h
                    </span>
                  )}
                </div>

                {/* Cards */}
                <div className="space-y-2 min-h-[200px]">
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      projectColor={getProjectColor(task.projectId)}
                      projectName={getProjectName(task.projectId)}
                      isDragging={draggingId === task.id}
                      onDragStart={handleDragStart}
                      onTaskClick={setSelectedTask}
                    />
                  ))}

                  {colTasks.length === 0 && (
                    <div className="border border-dashed border-border/30 rounded-sm p-6 text-center">
                      <p className="font-mono text-[10px] text-muted-foreground">
                        Drop tasks here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Task detail modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          getProjectName={getProjectName}
        />
      )}

      {/* Recurring completion modal */}
      {completionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background border border-border/60 rounded-sm w-full max-w-md mx-4 shadow-2xl">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-blue-400" />
                  <p className="font-mono text-xs text-primary uppercase tracking-widest">
                    Complete Recurring Task
                  </p>
                </div>
                <button
                  onClick={() => setCompletionModal(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="font-mono text-xs text-foreground leading-relaxed">
                {completionModal.taskTitle}
              </p>

              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  What did you find/do?
                </label>
                <textarea
                  autoFocus
                  rows={3}
                  value={completionComment}
                  onChange={(e) => setCompletionComment(e.target.value)}
                  placeholder="Checked 3 contracts. New msg from Ali re: mapping. Drafted response."
                  className="w-full bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                />
                <p className="font-mono text-[10px] text-muted-foreground">
                  {completionComment.trim().length}/10 min characters
                </p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleCompleteRecurring}
                  disabled={completing || completionComment.trim().length < 10}
                  className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs uppercase tracking-widest px-5 py-2.5 rounded-sm hover:bg-emerald-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  {completing ? "Completing..." : "Complete & Reset"}
                </button>
                <button
                  onClick={() => setCompletionModal(null)}
                  className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TaskDetailModal({
  task,
  onClose,
  getProjectName,
}: {
  task: Task
  onClose: () => void
  getProjectName: (id: string) => string
}) {
  const [history, setHistory] = useState<TaskHistoryEntry[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoadingHistory(true)
    fetch(`/api/admin/tasks/${task.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setHistory(data.history ?? [])
          setLoadingHistory(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingHistory(false)
      })
    return () => { cancelled = true }
  }, [task.id])

  const priorityCfg = TASK_PRIORITY_CONFIG[task.priority] ?? TASK_PRIORITY_CONFIG.medium
  const statusCfg = TASK_STATUS_CONFIG[task.status] ?? TASK_STATUS_CONFIG.backlog
  const cardType = task.cardType ?? "one_off"
  const typeCfg = CARD_TYPE_CONFIG[cardType]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border/60 rounded-sm w-full max-w-2xl mx-4 shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <p className="font-mono text-sm text-foreground leading-relaxed">{task.title}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] text-muted-foreground">{task.taskId}</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm font-mono text-[10px] uppercase tracking-widest border ${statusCfg.className}`}>
                  {statusCfg.label}
                </span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm font-mono text-[10px] uppercase tracking-widest ${priorityCfg.className}`}>
                  {priorityCfg.label}
                </span>
                {cardType !== "one_off" && (
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm font-mono text-[10px] border ${typeCfg.className}`}>
                    {typeCfg.label}
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Project</span>
              <p className="text-foreground">{getProjectName(task.projectId)}</p>
            </div>
            {task.assignee && (
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Assignee</span>
                <p className="text-foreground">{task.assignee}</p>
              </div>
            )}
            {task.hours != null && (
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Hours</span>
                <p className="text-foreground">{task.hours}h</p>
              </div>
            )}
            {task.sprint && (
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Sprint</span>
                <p className="text-foreground">{task.sprint}</p>
              </div>
            )}
            {task.dueDate && (
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Due</span>
                <p className="text-foreground">{new Date(task.dueDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Description</p>
              <p className="font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Acceptance Criteria */}
          {task.acceptanceCriteria.length > 0 && (
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Acceptance Criteria</p>
              <ul className="space-y-1">
                {task.acceptanceCriteria.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 font-mono text-xs text-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Definition of Done */}
          {task.definitionOfDone.length > 0 && (
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Definition of Done</p>
              <ul className="space-y-1">
                {task.definitionOfDone.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 font-mono text-xs text-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Tags</p>
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-1.5 py-0.5 bg-muted/40 rounded-sm font-mono text-[10px] text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Artifacts */}
          {task.artifacts.length > 0 && (
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Artifacts</p>
              <div className="space-y-1">
                {task.artifacts.map((a, i) => (
                  <a key={i} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-mono text-xs text-blue-400 hover:underline">
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    {a.label || a.type}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(task.specUrl || task.outputUrl) && (
            <div className="flex items-center gap-4">
              {task.specUrl && (
                <a href={task.specUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-mono text-xs text-blue-400 hover:underline">
                  <FileText className="h-3 w-3" /> Spec
                </a>
              )}
              {task.outputUrl && (
                <a href={task.outputUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-mono text-xs text-blue-400 hover:underline">
                  <ExternalLink className="h-3 w-3" /> Output
                </a>
              )}
            </div>
          )}

          {/* History */}
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">History</p>
            {loadingHistory ? (
              <p className="font-mono text-[10px] text-muted-foreground">Loading...</p>
            ) : history.length === 0 ? (
              <p className="font-mono text-[10px] text-muted-foreground">No history</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.map((entry) => (
                  <div key={entry.id} className="border-l-2 border-border/40 pl-3 py-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-foreground">{entry.event}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{entry.actor}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatCountdown(isoDate: string): string | null {
  const diff = new Date(isoDate).getTime() - Date.now()
  if (diff <= 0) return "overdue"
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function TaskCard({
  task,
  projectColor,
  projectName,
  isDragging,
  onDragStart,
  onTaskClick,
}: {
  task: Task
  projectColor: string
  projectName: string
  isDragging: boolean
  onDragStart: (e: React.DragEvent, id: string) => void
  onTaskClick: (task: Task) => void
}) {
  const priorityCfg = TASK_PRIORITY_CONFIG[task.priority] ?? TASK_PRIORITY_CONFIG.medium
  const cardType = task.cardType ?? "one_off"
  const typeCfg = CARD_TYPE_CONFIG[cardType]
  const isStanding = cardType === "standing"
  const isRecurring = cardType === "recurring"

  return (
    <div
      data-task-id={task.id}
      draggable={!isStanding}
      onDragStart={(e) => !isStanding && onDragStart(e, task.id)}
      onClick={() => onTaskClick(task)}
      className={`border border-border/40 rounded-sm bg-background transition-all ${
        isStanding
          ? "cursor-default ring-1 ring-amber-400/20"
          : "cursor-grab active:cursor-grabbing"
      } ${isDragging ? "opacity-40 scale-95" : "hover:border-border"}`}
      style={{ borderLeftWidth: "4px", borderLeftColor: projectColor }}
    >
      <div className="p-3 space-y-2">
        {/* Top row: priority + card type badge + task ID */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-sm font-mono text-[10px] uppercase tracking-widest ${priorityCfg.className}`}
            >
              {priorityCfg.label}
            </span>
            {cardType !== "one_off" && (
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm font-mono text-[10px] border ${typeCfg.className}`}
              >
                {isRecurring && <RefreshCw className="h-2.5 w-2.5" />}
                {isStanding && <Pin className="h-2.5 w-2.5" />}
                {typeCfg.label}
              </span>
            )}
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            {task.taskId}
          </span>
        </div>

        {/* Title */}
        <p className="font-mono text-xs text-foreground leading-relaxed line-clamp-2">
          {task.title}
        </p>

        {/* Project name */}
        <p className="font-mono text-[10px] text-muted-foreground">
          {projectName}
        </p>

        {/* Recurrence info: progress + streak + frequency + last comment */}
        {isRecurring && task.recurrence && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-mono text-[10px]">
              {task.recurrence.targetCount ? (
                <span className="text-muted-foreground">
                  {task.recurrence.todayCount ?? 0}/{task.recurrence.targetCount} today
                </span>
              ) : (task.recurrence.todayCount ?? 0) > 0 ? (
                <span className="text-muted-foreground">
                  {task.recurrence.todayCount} today
                </span>
              ) : null}
              {task.recurrence.streak > 0 && (
                <span className="flex items-center gap-0.5 text-orange-400">
                  <Flame className="h-3 w-3" />
                  {task.recurrence.streak}
                </span>
              )}
              <span className="text-muted-foreground">
                {RECURRENCE_FREQUENCY_LABELS[task.recurrence.frequency]}
              </span>
              {task.status === "done" && task.recurrence.nextDue && (
                <span className="flex items-center gap-0.5 text-blue-400">
                  <Timer className="h-3 w-3" />
                  {formatCountdown(task.recurrence.nextDue)}
                </span>
              )}
            </div>
            {task.recurrence.targetCount != null && task.recurrence.targetCount > 0 && (
              <div className="flex gap-0.5">
                {Array.from({ length: task.recurrence.targetCount }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i < (task.recurrence?.todayCount ?? 0)
                        ? "bg-emerald-400"
                        : "bg-muted/40"
                    }`}
                  />
                ))}
              </div>
            )}
            {task.recurrence.completionLog && task.recurrence.completionLog.length > 0 && (
              <div className="flex items-start gap-1 text-muted-foreground">
                <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                <p className="font-mono text-[10px] line-clamp-1">
                  {task.recurrence.completionLog[task.recurrence.completionLog.length - 1].comment}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-1.5 py-0.5 bg-muted/40 rounded-sm font-mono text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="font-mono text-[10px] text-muted-foreground">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Bottom row: hours, links, grip */}
        <div className="flex items-center justify-between pt-1 border-t border-border/20">
          <div className="flex items-center gap-2">
            {task.hours && (
              <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.hours}h
              </span>
            )}
            {task.assignee && (
              <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[80px]">
                {task.assignee}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {task.specUrl && (
              <a
                href={task.specUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <FileText className="h-3 w-3" />
              </a>
            )}
            {task.outputUrl && (
              <a
                href={task.outputUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <GripVertical className="h-3.5 w-3.5 text-border" />
          </div>
        </div>
      </div>
    </div>
  )
}
