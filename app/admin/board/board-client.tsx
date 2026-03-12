"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
} from "lucide-react"
import { toast } from "sonner"
import { useTaskStore } from "@/lib/stores/task-store"
import {
  BOARD_COLUMNS,
  TASK_PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
} from "@/lib/types/task"
import type { Task, TaskStatus, TaskPriority, BoardProject } from "@/lib/types/task"

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

  const [initialized, setInitialized] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    projectId: projects[0]?.id ?? "",
    priority: "medium" as TaskPriority,
    status: "backlog" as TaskStatus,
    tags: "",
    hours: "",
    description: "",
  })

  useEffect(() => {
    useTaskStore.setState({ tasks: initialTasks })
    if (!initialized) setInitialized(true)
  }, [initialTasks, initialized])

  // Refetch tasks when board tab becomes visible (e.g. after navigating back from milestone)
  // so milestone→board sync is visible even if RSC was cached
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchTasks(filters.projectId)
    }
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisible)
      return () => document.removeEventListener("visibilitychange", onVisible)
    }
  }, [filters.projectId, fetchTasks])

  const visible = initialized ? filteredTasks() : initialTasks

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

    const success = await moveTask(taskId, newStatus)
    if (!success) {
      toast.error(`Cannot move to ${TASK_STATUS_CONFIG[newStatus].label}`)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const result = await createTask({
      title: newTask.title,
      projectId: newTask.projectId,
      priority: newTask.priority,
      status: newTask.status,
      description: newTask.description || undefined,
      tags: newTask.tags
        ? newTask.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined,
      hours: newTask.hours ? Number(newTask.hours) : undefined,
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
      })
      setShowCreate(false)
    } else {
      toast.error("Failed to create task")
    }
  }

  const columnTasks = (status: TaskStatus) =>
    visible.filter((t) => t.status === status)

  const totalTasks = tasks.length
  const inProgressCount = tasks.filter(
    (t) => t.status === "in_progress",
  ).length
  const blockedCount = tasks.filter((t) => t.status === "blocked").length

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
              {projects.map((p) => (
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
                  {projects.map((p) => (
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
    </div>
  )
}

function TaskCard({
  task,
  projectColor,
  projectName,
  isDragging,
  onDragStart,
}: {
  task: Task
  projectColor: string
  projectName: string
  isDragging: boolean
  onDragStart: (e: React.DragEvent, id: string) => void
}) {
  const priorityCfg = TASK_PRIORITY_CONFIG[task.priority]

  return (
    <div
      data-task-id={task.id}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className={`border border-border/40 rounded-sm bg-background transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-40 scale-95" : "hover:border-border"
      }`}
      style={{ borderLeftWidth: "4px", borderLeftColor: projectColor }}
    >
      <div className="p-3 space-y-2">
        {/* Top row: priority + task ID */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded-sm font-mono text-[10px] uppercase tracking-widest ${priorityCfg.className}`}
          >
            {priorityCfg.label}
          </span>
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
