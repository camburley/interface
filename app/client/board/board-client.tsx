"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import {
  Plus,
  GripVertical,
  ExternalLink,
  FileText,
  LayoutGrid,
  X,
  Clock,
  CheckCircle,
  Trash2,
  MessageSquare,
  Send,
  ArrowLeft,
  Eye,
  Bug,
  Sparkles,
  Zap,
  HelpCircle,
  Github,
  AlertTriangle,
  Code,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Loader2,
  ImagePlus,
  RefreshCw,
  Link2,
} from "lucide-react"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useClientTaskStore } from "@/lib/stores/client-task-store"
import {
  TASK_PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
} from "@/lib/types/task"
import type { Task, TaskStatus } from "@/lib/types/task"

const CLIENT_COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "blocked", title: "Blocked" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
]

interface Props {
  initialTasks: Task[]
  projectName: string
  projectColor: string
  clientName: string
  readOnly?: boolean
  adminPreview?: boolean
  repoConnected?: boolean
  projectId?: string
}

export function ClientBoardClient({
  initialTasks,
  projectName,
  projectColor,
  clientName,
  readOnly = false,
  adminPreview = false,
  repoConnected = false,
  projectId,
}: Props) {
  const {
    tasks,
    fetchTasks,
    createTask,
    deleteTask,
    reorderTasks,
    addComment,
    tasksByStatus,
  } = useClientTaskStore()

  const [initialized, setInitialized] = useState(false)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newType, setNewType] = useState<"feature" | "bug">("feature")
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium")
  const [newCriteria, setNewCriteria] = useState<string[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showScoping, setShowScoping] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (readOnly || adminPreview) return
    const key = `burley_board_welcomed_${clientName}`
    if (!localStorage.getItem(key)) {
      setShowWelcome(true)
    }
  }, [readOnly, adminPreview, clientName])

  function dismissWelcome() {
    const key = `burley_board_welcomed_${clientName}`
    localStorage.setItem(key, "1")
    setShowWelcome(false)
  }

  useEffect(() => {
    useClientTaskStore.setState({ tasks: initialTasks })
    if (!initialized) setInitialized(true)
  }, [initialTasks, initialized])

  useEffect(() => {
    if (!readOnly && !adminPreview) fetchTasks()
  }, [readOnly, adminPreview]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (readOnly || adminPreview) return
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchTasks()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [readOnly, adminPreview, fetchTasks])

  useEffect(() => {
    if (readOnly || adminPreview) return
    const interval = setInterval(() => fetchTasks(), 15_000)
    return () => clearInterval(interval)
  }, [readOnly, adminPreview, fetchTasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const columnTasks = useCallback(
    (status: TaskStatus) => {
      const col = (initialized ? tasks : initialTasks).filter(
        (t) => t.status === status,
      )
      col.sort((a, b) => (a.position ?? 99999) - (b.position ?? 99999))
      return col
    },
    [initialized, tasks, initialTasks],
  )

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task && task.status !== "todo") return
    setActiveTask(task ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over || active.id === over.id) return

    const activeTaskObj = tasks.find((t) => t.id === active.id)
    if (!activeTaskObj || activeTaskObj.status !== "todo") return

    const overTaskObj = tasks.find((t) => t.id === over.id)
    if (!overTaskObj || overTaskObj.status !== "todo") return

    const col = columnTasks("todo")
    const oldIndex = col.findIndex((t) => t.id === active.id)
    const newIndex = col.findIndex((t) => t.id === over.id)
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

    const reordered = arrayMove(col, oldIndex, newIndex)
    const items = reordered.map((t, i) => ({ id: t.id, position: i }))

    const success = await reorderTasks(items)
    if (!success) toast.error("Failed to reorder tasks")
  }

  function resetCreateForm() {
    setNewTitle("")
    setNewDescription("")
    setNewType("feature")
    setNewPriority("medium")
    setNewCriteria([])
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    const filteredCriteria = newCriteria.map((c) => c.trim()).filter(Boolean)
    const result = await createTask({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      tags: [newType],
      priority: newPriority,
      acceptanceCriteria: filteredCriteria.length > 0 ? filteredCriteria : undefined,
      projectId,
    })
    setCreating(false)

    if (result) {
      toast.success(`${result.taskId} created`)
      resetCreateForm()
      setShowCreate(false)
    } else {
      toast.error("Failed to create task")
    }
  }

  const todoCount = columnTasks("todo").length
  const inProgressCount = columnTasks("in_progress").length
  const blockedCount = columnTasks("blocked").length
  const reviewCount = columnTasks("review").length
  const doneCount = columnTasks("done").length

  return (
    <div className="min-h-screen bg-background text-foreground">
      {adminPreview && (
        <div className="bg-amber-400/10 border-b border-amber-400/30">
          <div className="max-w-[1600px] mx-auto px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-amber-400">
              <Eye className="h-3.5 w-3.5" />
              Viewing as client: {clientName || "Unknown"}
            </div>
            <Link
              href="/admin/board?type=client"
              className="flex items-center gap-1.5 font-mono text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to admin board
            </Link>
          </div>
        </div>
      )}
      <header className="border-b border-border/40 sticky top-0 z-10 backdrop-blur-sm bg-background/80">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bebas text-2xl tracking-tight">Burley</span>
            <span className="font-mono text-xs text-muted-foreground border border-border/50 rounded-sm px-2 py-0.5 bg-primary/10 text-primary">
              {clientName || "Client"}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              <LayoutGrid className="inline h-3.5 w-3.5 mr-1" />
              {projectName}
            </span>
          </div>
          <button
            onClick={() => setShowWelcome(true)}
            className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            title="How it works"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Stats + actions */}
        <div className="flex items-center gap-6 mb-6 font-mono text-xs">
          <div className="flex items-center gap-2 text-blue-400">
            <span>{todoCount} to do</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400">
            <Clock className="h-3.5 w-3.5" />
            <span>{inProgressCount} in progress</span>
          </div>
          {blockedCount > 0 && (
            <div className="flex items-center gap-2 text-red-400">
              <span>{blockedCount} blocked</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-purple-400">
            <span>{reviewCount} review</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>{doneCount} done</span>
          </div>

          {!readOnly && (
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowScoping(true)}
                className="flex items-center gap-1.5 border border-primary/40 text-primary font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-sm hover:bg-primary/10 transition-colors"
              >
                <Zap className="h-3.5 w-3.5" />
                Size It
              </button>
              <button
                onClick={() => setShowCreate(!showCreate)}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-sm hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                New Item
              </button>
            </div>
          )}
        </div>

        {/* Create task modal */}
        {showCreate && !readOnly && (
          <CreateTaskModal
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            newDescription={newDescription}
            setNewDescription={setNewDescription}
            newType={newType}
            setNewType={setNewType}
            newPriority={newPriority}
            setNewPriority={setNewPriority}
            newCriteria={newCriteria}
            setNewCriteria={setNewCriteria}
            creating={creating}
            onSubmit={handleCreate}
            onClose={() => { resetCreateForm(); setShowCreate(false) }}
          />
        )}

        {/* Kanban board */}
        <DndContext
          id="client-board-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {CLIENT_COLUMNS.map((column) => {
              const colTasks = columnTasks(column.id)
              const isTodo = column.id === "todo"

              return (
                <div key={column.id} className="flex-shrink-0 w-72">
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
                  </div>

                  {/* Cards */}
                  {isTodo && !readOnly ? (
                    <SortableContext
                      items={colTasks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2 min-h-[200px]">
                        {colTasks.map((task) => (
                          <SortableClientCard
                            key={task.id}
                            task={task}
                            projectColor={projectColor}
                            onDelete={deleteTask}
                            onTaskClick={setSelectedTask}
                          />
                        ))}
                        {colTasks.length === 0 && (
                          <div className="border border-dashed border-border/30 rounded-sm p-6 text-center">
                            <p className="font-mono text-[10px] text-muted-foreground">
                              Add items here
                            </p>
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  ) : (
                    <div className="space-y-2 min-h-[200px]">
                      {colTasks.map((task) => (
                        <ClientCard
                          key={task.id}
                          task={task}
                          projectColor={projectColor}
                          isReview={column.id === "review" && !readOnly}
                          onComment={addComment}
                          onTaskClick={setSelectedTask}
                        />
                      ))}
                      {colTasks.length === 0 && (
                        <div className="border border-dashed border-border/30 rounded-sm p-6 text-center">
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {column.id === "done" ? "Completed items" : "No items yet"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="opacity-80 scale-105 shadow-2xl">
                <CardContent
                  task={activeTask}
                  projectColor={projectColor}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task detail modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onComment={readOnly ? undefined : addComment}
          onDelete={!readOnly && selectedTask.status === "todo" ? deleteTask : undefined}
          onRefresh={fetchTasks}
        />
      )}

      {showScoping && !readOnly && (
        <ScopingPanel
          repoConnected={repoConnected}
          existingTasks={tasks}
          projectId={projectId}
          onClose={() => setShowScoping(false)}
          onAddTask={async (data) => {
            const payload = projectId ? { ...data, projectId } : data
            const result = await createTask(payload)
            if (result) toast.success(`${result.taskId} created`)
            else toast.error("Failed to add task")
            return !!result
          }}
        />
      )}

      {showWelcome && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-background border border-border/60 rounded-sm w-full max-w-xl mx-4 shadow-2xl overflow-hidden">
            {/* Header accent bar */}
            <div className="h-1 bg-primary" />

            <div className="p-8 space-y-6">
              {/* Welcome */}
              <div className="text-center space-y-2">
                <p className="font-mono text-[10px] text-primary uppercase tracking-[0.3em]">
                  Welcome to Core
                </p>
                <h2 className="font-bebas text-4xl tracking-tight text-foreground">
                  Hey {clientName || "there"}, this is your board.
                </h2>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                  Everything you want built lives here. No emails, no scope docs,
                  no back-and-forth. Just a queue that moves.
                </p>
              </div>

              {/* How it works */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
                    <span className="font-mono text-xs text-blue-400 font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-foreground font-medium">
                      Add items to To Do
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                      Drop in anything you want built — features, fixes, tools, ideas.
                      Add as many as you want. Reorder them by priority anytime.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                    <span className="font-mono text-xs text-amber-400 font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-foreground font-medium">
                      Work moves to In Progress
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                      Cam pulls from the top of your queue. When something is being
                      worked on, it moves here automatically. You&apos;ll see it shift in real time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-purple-400/10 border border-purple-400/20 flex items-center justify-center">
                    <span className="font-mono text-xs text-purple-400 font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-foreground font-medium">
                      Review what&apos;s delivered
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                      Completed work lands in Review for you to check. Add feedback,
                      drop a link, or leave a comment — right on the card.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                    <span className="font-mono text-xs text-emerald-400 font-bold">4</span>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-foreground font-medium">
                      Done is done
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                      Approved items move to Done. Your full history of shipped
                      work stays visible. No chasing status updates.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center pt-2">
                <button
                  onClick={dismissWelcome}
                  className="bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-8 py-3 rounded-sm hover:bg-primary/90 transition-colors"
                >
                  Got it, let&apos;s go
                </button>
                <p className="font-mono text-[10px] text-muted-foreground mt-3">
                  This board updates in real time. No refresh needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const PRIORITY_OPTIONS: { value: "low" | "medium" | "high"; label: string; cls: string }[] = [
  { value: "low", label: "Low", cls: "text-muted-foreground border-border/50 hover:border-muted-foreground/60" },
  { value: "medium", label: "Medium", cls: "text-blue-400 border-blue-400/40 hover:border-blue-400/70" },
  { value: "high", label: "High", cls: "text-amber-400 border-amber-400/40 hover:border-amber-400/70" },
]

function CreateTaskModal({
  newTitle,
  setNewTitle,
  newDescription,
  setNewDescription,
  newType,
  setNewType,
  newPriority,
  setNewPriority,
  newCriteria,
  setNewCriteria,
  creating,
  onSubmit,
  onClose,
}: {
  newTitle: string
  setNewTitle: (v: string) => void
  newDescription: string
  setNewDescription: (v: string) => void
  newType: "feature" | "bug"
  setNewType: (v: "feature" | "bug") => void
  newPriority: "low" | "medium" | "high"
  setNewPriority: (v: "low" | "medium" | "high") => void
  newCriteria: string[]
  setNewCriteria: (v: string[]) => void
  creating: boolean
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}) {
  function addCriterion() {
    setNewCriteria([...newCriteria, ""])
  }

  function updateCriterion(index: number, value: string) {
    const updated = [...newCriteria]
    updated[index] = value
    setNewCriteria(updated)
  }

  function removeCriterion(index: number) {
    setNewCriteria(newCriteria.filter((_, i) => i !== index))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border/60 rounded-sm w-full max-w-xl mx-4 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-primary" />

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-primary uppercase tracking-widest">
              New Item
            </p>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Type + Priority row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Type toggle */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewType("feature")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-sm font-mono text-xs transition-all ${
                    newType === "feature"
                      ? "border-blue-400 bg-blue-400/10 text-blue-400"
                      : "border-border/50 text-muted-foreground hover:border-muted-foreground/60"
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  Feature
                </button>
                <button
                  type="button"
                  onClick={() => setNewType("bug")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-sm font-mono text-xs transition-all ${
                    newType === "bug"
                      ? "border-red-400 bg-red-400/10 text-red-400"
                      : "border-border/50 text-muted-foreground hover:border-muted-foreground/60"
                  }`}
                >
                  <Bug className="h-3 w-3" />
                  Bug
                </button>
              </div>
            </div>

            {/* Priority selector */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                Priority
              </label>
              <div className="flex gap-2">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNewPriority(opt.value)}
                    className={`px-3 py-1.5 border rounded-sm font-mono text-xs transition-all ${
                      newPriority === opt.value
                        ? `${opt.cls} bg-current/10`
                        : "border-border/50 text-muted-foreground hover:border-muted-foreground/60"
                    }`}
                    style={
                      newPriority === opt.value
                        ? { backgroundColor: opt.value === "low" ? "rgba(161,161,170,0.1)" : opt.value === "medium" ? "rgba(96,165,250,0.1)" : "rgba(251,191,36,0.1)" }
                        : undefined
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Title
            </label>
            <input
              required
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What needs to be done..."
              className="w-full bg-muted/20 border border-border/50 rounded-sm px-3 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Description
            </label>
            <textarea
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Context, details, links..."
              className="w-full bg-muted/20 border border-border/50 rounded-sm px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Acceptance criteria */}
          <div className="space-y-2">
            <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Acceptance Criteria
            </label>
            {newCriteria.map((criterion, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground/50 w-5 text-right shrink-0">
                  {i + 1}.
                </span>
                <input
                  value={criterion}
                  onChange={(e) => updateCriterion(i, e.target.value)}
                  placeholder="How we know this is done..."
                  className="flex-1 bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => removeCriterion(i)}
                  className="text-muted-foreground hover:text-red-400 transition-colors shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addCriterion}
              className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
            >
              <Plus className="h-3 w-3" />
              Add criterion
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-border/20">
            <button
              type="submit"
              disabled={creating || !newTitle.trim()}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-5 py-2.5 rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              {creating ? "Adding..." : "Add to Board"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface SizedTask {
  title: string
  description: string
  clientDescription?: string
  category: string
  size: "S" | "M" | "L"
  acceptance: string | string[]
  definitionOfDone?: string[]
  updatesExistingTask?: string
  dependsOnExisting?: string[]
}

interface SizeResult {
  tasks: SizedTask[]
  summary: string
  warnings: string[]
  consolidations?: { task: string; note: string }[]
}

const SIZE_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  S: { text: "text-emerald-400", border: "border-emerald-400/40", bg: "bg-emerald-400/10" },
  M: { text: "text-amber-400", border: "border-amber-400/40", bg: "bg-amber-400/10" },
  L: { text: "text-rose-400", border: "border-rose-400/40", bg: "bg-rose-400/10" },
}

const CATEGORY_ICONS: Record<string, string> = {
  feature: "◈",
  integration: "⟷",
  design: "◻",
  infrastructure: "▣",
  fix: "⚡",
  automation: "⟳",
  api: "⌁",
  "internal-tool": "⊞",
  refactor: "↻",
}

function ScopingPanel({
  repoConnected,
  onClose,
  onAddTask,
  existingTasks = [],
  projectId,
}: {
  repoConnected?: boolean
  onClose: () => void
  existingTasks?: { title: string; status: string; description?: string; tags?: string[] }[]
  projectId?: string
  onAddTask: (data: {
    title: string
    description?: string
    clientDescription?: string
    tags?: string[]
    priority?: "low" | "medium" | "high"
    acceptanceCriteria?: string[]
    definitionOfDone?: string[]
  }) => Promise<boolean>
}) {
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SizeResult | null>(null)
  const [addedIndices, setAddedIndices] = useState<Set<number>>(new Set())
  const [addingAll, setAddingAll] = useState(false)
  const [credOpen, setCredOpen] = useState(false)
  const [credService, setCredService] = useState("")
  const [credLoading, setCredLoading] = useState(false)
  const [credResult, setCredResult] = useState<{
    service: string
    credentials: { name: string; example?: string; where: string; note?: string }[]
    tip: string
  } | null>(null)
  const [credError, setCredError] = useState<string | null>(null)
  const [attachedImages, setAttachedImages] = useState<{ data: string; mediaType: string; preview: string }[]>([])
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function processFiles(files: FileList | File[]) {
    const allowed = ["image/png", "image/jpeg", "image/gif", "image/webp"]
    const maxSize = 5 * 1024 * 1024 // 5MB
    const fileArray = Array.from(files).filter(
      (f) => allowed.includes(f.type) && f.size <= maxSize,
    )
    if (fileArray.length === 0) return

    for (const file of fileArray.slice(0, 5 - attachedImages.length)) {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(",")[1]
        setAttachedImages((prev) => [
          ...prev.slice(0, 4),
          { data: base64, mediaType: file.type, preview: result },
        ])
      }
      reader.readAsDataURL(file)
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = Array.from(e.clipboardData.items)
    const imageFiles = items
      .filter((item) => item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter(Boolean) as File[]
    if (imageFiles.length > 0) {
      e.preventDefault()
      processFiles(imageFiles)
    }
  }

  function removeImage(index: number) {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleCredLookup() {
    if (credLoading || credService.trim().length < 2) return
    setCredLoading(true)
    setCredError(null)
    setCredResult(null)
    try {
      const res = await fetch("/api/client/credential-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: credService.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCredError(data.error || "Something went wrong.")
        return
      }
      setCredResult(data)
    } catch {
      setCredError("Network error. Please try again.")
    } finally {
      setCredLoading(false)
    }
  }

  async function handleScope() {
    if (loading || description.trim().length < 10) return
    setLoading(true)
    setError(null)
    setResult(null)
    setAddedIndices(new Set())

    try {
      const payload: { description: string; images?: { data: string; mediaType: string }[] } = {
        description: description.trim(),
      }
      if (attachedImages.length > 0) {
        payload.images = attachedImages.map(({ data, mediaType }) => ({ data, mediaType }))
      }
      const res = await fetch("/api/client/scope-feature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          existingTasks: existingTasks.map((t) => ({
            title: t.title,
            status: t.status,
            description: t.description,
            tags: t.tags,
          })),
          projectId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong.")
        return
      }
      setResult(data)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function sizeToPriority(size: string): "low" | "medium" | "high" {
    if (size === "S") return "low"
    if (size === "L") return "high"
    return "medium"
  }

  async function addTask(task: SizedTask, index: number) {
    const acceptance = Array.isArray(task.acceptance)
      ? task.acceptance
      : task.acceptance
        ? [task.acceptance]
        : undefined

    const ok = await onAddTask({
      title: task.title,
      description: task.description,
      clientDescription: task.clientDescription,
      tags: [task.category],
      priority: sizeToPriority(task.size),
      acceptanceCriteria: acceptance,
      definitionOfDone: task.definitionOfDone,
    })
    if (ok) {
      setAddedIndices((prev) => new Set(prev).add(index))
    }
  }

  async function addAllTasks() {
    if (!result) return
    setAddingAll(true)
    for (let i = 0; i < result.tasks.length; i++) {
      if (addedIndices.has(i)) continue
      await addTask(result.tasks[i], i)
    }
    setAddingAll(false)
  }

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onWheel={(e) => e.stopPropagation()}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background border-l border-border/60 shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="border-b border-border/40 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <p className="font-mono text-xs text-primary uppercase tracking-widest">
              Size Your Idea
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-5">
          {repoConnected && (
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400/70">
              <Github className="h-3 w-3" />
              Repo connected — scoping uses your codebase for context
            </div>
          )}

          {/* Input */}
          <div
            className={`border bg-card/30 rounded-sm overflow-hidden focus-within:border-primary/40 transition-colors ${
              dragging ? "border-primary/60 bg-primary/5" : "border-border/40"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files)
            }}
          >
            <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-border/20">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
              <span className="ml-1.5 font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">
                feature.md
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onPaste={handlePaste}
              placeholder="Describe what you want built... (paste screenshots here too)"
              rows={6}
              className="w-full bg-transparent px-3 py-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/30 resize-none focus:outline-none leading-relaxed"
            />

            {/* Attached images */}
            {attachedImages.length > 0 && (
              <div className="px-3 pb-2 flex gap-2 flex-wrap">
                {attachedImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Attachment ${i + 1}`}
                      className="h-16 w-16 object-cover rounded-sm border border-border/30"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 bg-background border border-border/40 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-2.5 w-2.5 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drag overlay */}
            {dragging && (
              <div className="px-3 pb-3">
                <div className="border-2 border-dashed border-primary/40 rounded-sm py-4 flex items-center justify-center">
                  <p className="font-mono text-[11px] text-primary/70">Drop images here</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-3 py-2.5 border-t border-border/20">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] text-muted-foreground/60">
                  {description.length > 0 ? `${description.length} chars` : "min 10 characters"}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) processFiles(e.target.files)
                    e.target.value = ""
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground/60 hover:text-foreground/70 transition-colors"
                  title="Attach screenshots or mockups"
                >
                  <ImagePlus className="h-3 w-3" />
                  {attachedImages.length > 0 ? `${attachedImages.length}/5` : "Add image"}
                </button>
              </div>
              <button
                onClick={handleScope}
                disabled={loading || description.trim().length < 10}
                className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-all rounded-sm ${
                  loading
                    ? "border border-primary/40 text-primary/40 cursor-wait"
                    : description.trim().length < 10
                      ? "border border-border/30 text-muted-foreground/30 cursor-not-allowed"
                      : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 border border-primary/40 border-t-primary animate-spin rounded-full" />
                    Sizing...
                  </span>
                ) : (
                  "Size It"
                )}
              </button>
            </div>
          </div>

          {!result && !loading && description.length === 0 && (
            <div className="space-y-2">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
                Try an example
              </p>
              {[
                "We updated our pricing. There are now 3 tiers and we need the pricing page rebuilt with the new prices, a monthly/annual toggle, and a comparison table showing what's included in each tier.",
                "We need tracking pixels installed for our marketing campaigns — TikTok and Meta — so we can see when someone visits the site, starts the flow, and completes it. Our marketing team needs to verify they're firing.",
                "We want a settings page where users can update their profile, change their password, and manage notification preferences. It should match the look and feel of the rest of the app.",
                "Add a way for users to export their data as a PDF or CSV. They should be able to pick a date range and choose which sections to include in the export.",
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setDescription(example)}
                  className="w-full text-left border border-border/30 hover:border-primary/30 rounded-sm px-3 py-2.5 transition-colors group"
                >
                  <p className="font-mono text-[11px] text-muted-foreground/80 group-hover:text-foreground/90 leading-relaxed line-clamp-2">
                    {example}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Integration credential helper */}
          <div className="border border-border/30 rounded-sm overflow-hidden">
            <button
              onClick={() => setCredOpen(!credOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-card/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="h-3 w-3 text-violet-400/80" />
                <span className="font-mono text-[10px] text-muted-foreground/80">
                  Integrating a service? Check what credentials you&apos;ll need
                </span>
              </div>
              {credOpen ? (
                <ChevronUp className="h-3 w-3 text-muted-foreground/60" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
              )}
            </button>

            {credOpen && (
              <div className="border-t border-border/20 px-3 py-3 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={credService}
                    onChange={(e) => setCredService(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCredLookup()}
                    placeholder="e.g. Stripe, TikTok, Mailchimp..."
                    className="flex-1 bg-transparent border border-border/40 rounded-sm px-2.5 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40"
                  />
                  <button
                    onClick={handleCredLookup}
                    disabled={credLoading || credService.trim().length < 2}
                    className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-sm disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                  >
                    {credLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Look up"
                    )}
                  </button>
                </div>

                {credError && (
                  <p className="font-mono text-[11px] text-rose-400">{credError}</p>
                )}

                {credResult && (
                  <div className="space-y-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-primary/70">
                      {credResult.service} — what to share
                    </p>

                    {/* Quick-reference table */}
                    <div className="border border-border/30 rounded-sm overflow-hidden">
                      <div className="grid grid-cols-2 border-b border-border/20 bg-card/40">
                        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60 px-3 py-1.5">
                          Credential
                        </p>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60 px-3 py-1.5">
                          Looks like
                        </p>
                      </div>
                      {credResult.credentials.map((cred, i) => (
                        <div
                          key={i}
                          className={`grid grid-cols-2 ${i < credResult.credentials.length - 1 ? "border-b border-border/10" : ""}`}
                        >
                          <p className="font-mono text-[11px] text-foreground/90 px-3 py-2">
                            {cred.name}
                          </p>
                          <p className="font-mono text-[10px] text-violet-400/80 px-3 py-2 break-all">
                            {cred.example || "—"}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Detail cards */}
                    <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
                      Where to find each one
                    </p>
                    {credResult.credentials.map((cred, i) => (
                      <div key={i} className="border border-border/20 rounded-sm px-3 py-2 space-y-1">
                        <p className="font-mono text-[11px] text-foreground/90 font-medium">
                          {cred.name}
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground/80 leading-relaxed">
                          {cred.where}
                        </p>
                        {cred.note && (
                          <p className="font-mono text-[10px] text-violet-400/70 leading-relaxed">
                            {cred.note}
                          </p>
                        )}
                      </div>
                    ))}
                    <p className="font-mono text-[10px] text-primary/70 leading-relaxed italic">
                      {credResult.tip}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="border border-rose-500/40 bg-rose-500/5 px-3 py-2.5 rounded-sm">
              <p className="font-mono text-xs text-rose-400">{error}</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Summary bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bebas text-2xl text-primary">{result.tasks.length}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    tasks
                  </span>
                  {(["S", "M", "L"] as const).map((s) => {
                    const count = result.tasks.filter((t) => t.size === s).length
                    if (!count) return null
                    const c = SIZE_COLORS[s]
                    return (
                      <span key={s} className={`border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest ${c.text} ${c.border}`}>
                        {count}{s}
                      </span>
                    )
                  })}
                </div>
                <button
                  onClick={addAllTasks}
                  disabled={addingAll || addedIndices.size === result.tasks.length}
                  className="flex items-center gap-1.5 bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Plus className="h-3 w-3" />
                  {addingAll ? "Adding..." : addedIndices.size === result.tasks.length ? "All Added" : "Add All"}
                </button>
              </div>

              {/* Task cards */}
              {result.tasks.map((task, i) => {
                const added = addedIndices.has(i)
                const sc = SIZE_COLORS[task.size] ?? SIZE_COLORS.M
                return (
                  <div
                    key={i}
                    className={`border rounded-sm transition-all ${
                      added ? "border-emerald-400/30 bg-emerald-400/5" : "border-border/40 hover:border-primary/30"
                    }`}
                  >
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest ${sc.text} ${sc.border}`}>
                            {task.size}
                          </span>
                          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70">
                            {CATEGORY_ICONS[task.category] || "◈"} {task.category}
                          </span>
                        </div>
                        {added ? (
                          <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400 shrink-0">
                            <CheckCircle className="h-3 w-3" />
                            Added
                          </span>
                        ) : (
                          <button
                            onClick={() => addTask(task, i)}
                            className="flex items-center gap-1 font-mono text-[10px] text-primary hover:text-primary/80 transition-colors shrink-0"
                          >
                            <Plus className="h-3 w-3" />
                            Add
                          </button>
                        )}
                      </div>
                      <p className="font-mono text-xs text-foreground leading-relaxed">
                        {task.title}
                      </p>
                      {task.clientDescription && (
                        <pre className="font-mono text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {task.clientDescription}
                        </pre>
                      )}
                      {!task.clientDescription && (
                        <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                          {task.description}
                        </p>
                      )}
                      {task.updatesExistingTask && (
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-amber-400/80 bg-amber-400/5 border border-amber-400/20 rounded-sm px-2 py-1">
                          <RefreshCw className="h-3 w-3" />
                          Updates: {task.updatesExistingTask}
                        </div>
                      )}
                      {task.dependsOnExisting && task.dependsOnExisting.length > 0 && (
                        <div className="flex items-start gap-1.5 font-mono text-[10px] text-sky-400/80 bg-sky-400/5 border border-sky-400/20 rounded-sm px-2 py-1">
                          <Link2 className="h-3 w-3 mt-0.5 shrink-0" />
                          <span>Depends on: {task.dependsOnExisting.join(", ")}</span>
                        </div>
                      )}
                      {task.acceptance && (
                        <div className="space-y-1">
                          <p className="font-mono text-[9px] uppercase tracking-widest text-primary/60">
                            Acceptance Criteria
                          </p>
                          {(Array.isArray(task.acceptance) ? task.acceptance : [task.acceptance]).map((a, j) => (
                            <p key={j} className="font-mono text-[10px] text-muted-foreground/80 leading-relaxed pl-2">
                              {j + 1}. {a}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Consolidations — existing tasks that need updating */}
              {result.consolidations && result.consolidations.length > 0 && (
                <div className="border border-amber-500/30 bg-amber-500/5 px-4 py-3 rounded-sm">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400 mb-1.5">
                    Existing Tasks to Update
                  </p>
                  {result.consolidations.map((c: { task: string; note: string }, i: number) => (
                    <p key={i} className="font-mono text-[11px] text-amber-300/80 leading-relaxed">
                      → <strong>{c.task}</strong>: {c.note}
                    </p>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {result.warnings?.length > 0 && (
                <div className="border border-sky-500/30 bg-sky-500/5 px-4 py-3 rounded-sm">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-sky-400 mb-1.5">
                    Heads up
                  </p>
                  {result.warnings.map((w, i) => (
                    <p key={i} className="font-mono text-[11px] text-sky-300/80 leading-relaxed">
                      → {w}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CardContent({
  task,
  projectColor,
}: {
  task: Task
  projectColor: string
}) {
  const priorityCfg =
    TASK_PRIORITY_CONFIG[task.priority] ?? TASK_PRIORITY_CONFIG.medium

  const isBlocked = task.status === "blocked"

  return (
    <div
      className={`border rounded-sm bg-background ${
        isBlocked ? "border-red-400/30 bg-red-400/5" : "border-border/40"
      }`}
      style={{ borderLeftWidth: "4px", borderLeftColor: isBlocked ? "#f87171" : projectColor }}
    >
      <div className="p-3 space-y-2">
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
        <p className="font-mono text-xs text-foreground leading-relaxed line-clamp-2">
          {task.title}
        </p>
        {isBlocked && task.blockedReason && (
          <div className="flex items-start gap-1.5 bg-red-400/10 border border-red-400/20 rounded-sm px-2 py-1.5">
            <AlertTriangle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
            <p className="font-mono text-[11px] text-red-400 leading-relaxed">
              {task.blockedReason}
            </p>
          </div>
        )}
        {!isBlocked && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-1.5 py-0.5 bg-muted/40 rounded-sm font-mono text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-1 border-t border-border/20">
          <div className="flex items-center gap-2">
            {task.hours && (
              <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.hours}h
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
          </div>
        </div>
      </div>
    </div>
  )
}

function SortableClientCard({
  task,
  projectColor,
  onDelete,
  onTaskClick,
}: {
  task: Task
  projectColor: string
  onDelete: (id: string) => Promise<boolean>
  onTaskClick: (task: Task) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        onClick={() => onTaskClick(task)}
        className="cursor-grab active:cursor-grabbing group relative"
      >
        <CardContent task={task} projectColor={projectColor} />
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(task.id).then((ok) => {
              if (ok) toast.success(`${task.taskId} removed`)
              else toast.error("Failed to remove")
            })
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <div className="absolute bottom-3 right-3">
          <GripVertical className="h-3.5 w-3.5 text-border" />
        </div>
      </div>
    </div>
  )
}

function ClientCard({
  task,
  projectColor,
  isReview,
  onComment,
  onTaskClick,
}: {
  task: Task
  projectColor: string
  isReview: boolean
  onComment: (taskId: string, content: string) => Promise<boolean>
  onTaskClick: (task: Task) => void
}) {
  const [showComment, setShowComment] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [sending, setSending] = useState(false)

  async function handleSendComment(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!commentText.trim()) return
    setSending(true)
    const ok = await onComment(task.id, commentText.trim())
    setSending(false)
    if (ok) {
      toast.success("Comment added")
      setCommentText("")
      setShowComment(false)
    } else {
      toast.error("Failed to add comment")
    }
  }

  return (
    <div>
      <div onClick={() => onTaskClick(task)} className="cursor-pointer">
        <CardContent task={task} projectColor={projectColor} />
      </div>
      {isReview && (
        <div className="mt-1">
          {!showComment ? (
            <button
              onClick={() => setShowComment(true)}
              className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1 py-0.5"
            >
              <MessageSquare className="h-3 w-3" />
              Add feedback
            </button>
          ) : (
            <form
              onSubmit={handleSendComment}
              className="flex items-center gap-1.5 mt-1"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                autoFocus
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Feedback or link..."
                className="flex-1 bg-muted/20 border border-border/50 rounded-sm px-2 py-1 font-mono text-[10px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                disabled={sending || !commentText.trim()}
                className="text-primary hover:text-primary/80 transition-colors disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowComment(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

function TaskDetailModal({
  task,
  onClose,
  onComment,
  onDelete,
  onRefresh,
}: {
  task: Task
  onClose: () => void
  onComment?: (taskId: string, content: string) => Promise<boolean>
  onDelete?: (id: string) => Promise<boolean>
  onRefresh: () => Promise<void>
}) {
  const [commentText, setCommentText] = useState("")
  const [sending, setSending] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showTechnical, setShowTechnical] = useState(false)
  const [history, setHistory] = useState<
    { id: string; event: string; actor: string; timestamp: string; details?: Record<string, unknown> }[]
  >([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoadingHistory(true)
    fetch(`/api/client/tasks/${task.id}/history`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((data) => {
        if (!cancelled) {
          setHistory(data.history ?? [])
          setLoadingHistory(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingHistory(false)
      })
    return () => {
      cancelled = true
    }
  }, [task.id])

  const priorityCfg =
    TASK_PRIORITY_CONFIG[task.priority] ?? TASK_PRIORITY_CONFIG.medium
  const statusCfg = TASK_STATUS_CONFIG[task.status] ?? TASK_STATUS_CONFIG.todo
  const isReview = task.status === "review" && !!onComment
  const isTodo = task.status === "todo"

  async function handleSendComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim() || !onComment) return
    setSending(true)
    const ok = await onComment(task.id, commentText.trim())
    setSending(false)
    if (ok) {
      toast.success("Comment added")
      setCommentText("")
      await onRefresh()
    } else {
      toast.error("Failed to add comment")
    }
  }

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
              <p className="font-mono text-sm text-foreground leading-relaxed">
                {task.title}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {task.taskId}
                </span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-sm font-mono text-[10px] uppercase tracking-widest border ${statusCfg.className}`}
                >
                  {statusCfg.label}
                </span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-sm font-mono text-[10px] uppercase tracking-widest ${priorityCfg.className}`}
                >
                  {priorityCfg.label}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Blocked reason */}
          {task.status === "blocked" && task.blockedReason && (
            <div className="flex items-start gap-2 bg-red-400/10 border border-red-400/20 rounded-sm px-3 py-2.5">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-mono text-[10px] text-red-400 uppercase tracking-widest mb-0.5">
                  Blocked
                </p>
                <p className="font-mono text-xs text-red-400 leading-relaxed">
                  {task.blockedReason}
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          {(task.clientDescription || task.description) && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  {showTechnical ? "Technical Details" : "Description"}
                </p>
                {task.clientDescription && task.description && (
                  <button
                    onClick={() => setShowTechnical(!showTechnical)}
                    className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  >
                    <Code className="h-3 w-3" />
                    {showTechnical ? "Simple view" : "Technical"}
                  </button>
                )}
              </div>
              <p className="font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {showTechnical ? task.description : (task.clientDescription || task.description)}
              </p>
            </div>
          )}

          {/* Acceptance Criteria */}
          {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">
                Acceptance Criteria
              </p>
              <div className="space-y-1.5">
                {task.acceptanceCriteria.map((criterion, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="font-mono text-[10px] text-primary/60 shrink-0 mt-0.5 w-4 text-right">
                      {i + 1}.
                    </span>
                    <p className="font-mono text-[11px] text-foreground/80 leading-relaxed">
                      {criterion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Definition of Done */}
          {task.definitionOfDone && task.definitionOfDone.length > 0 && (
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">
                Definition of Done
              </p>
              <div className="space-y-1.5">
                {task.definitionOfDone.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-emerald-400/40 shrink-0 mt-0.5" />
                    <p className="font-mono text-[11px] text-foreground/80 leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                Tags
              </p>
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-1.5 py-0.5 bg-muted/40 rounded-sm font-mono text-[10px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(task.specUrl || task.outputUrl) && (
            <div className="flex items-center gap-4">
              {task.specUrl && (
                <a
                  href={task.specUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 font-mono text-xs text-blue-400 hover:underline"
                >
                  <FileText className="h-3 w-3" /> Spec
                </a>
              )}
              {task.outputUrl && (
                <a
                  href={task.outputUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 font-mono text-xs text-blue-400 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Output
                </a>
              )}
            </div>
          )}

          {/* Comment input for Review tasks */}
          {isReview && (
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
                Add feedback or link
              </p>
              <form onSubmit={handleSendComment} className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Your feedback, a link, notes..."
                  className="flex-1 bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={sending || !commentText.trim()}
                  className="flex items-center gap-1.5 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>
            </div>
          )}

          {/* Delete for To Do tasks */}
          {isTodo && onDelete && (
            <div className="flex items-center gap-3 pt-2 border-t border-border/20">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 font-mono text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove Item
                </button>
              ) : (
                <>
                  <button
                    onClick={async () => {
                      setDeleting(true)
                      const ok = await onDelete(task.id)
                      setDeleting(false)
                      if (ok) {
                        toast.success(`${task.taskId} removed`)
                        onClose()
                      } else {
                        toast.error("Failed to remove")
                        setConfirmDelete(false)
                      }
                    }}
                    disabled={deleting}
                    className="flex items-center gap-1.5 bg-red-500/20 text-red-400 border border-red-500/30 font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deleting ? "Removing..." : "Confirm Remove"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}

          {/* History */}
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
              Activity
            </p>
            {loadingHistory ? (
              <p className="font-mono text-[10px] text-muted-foreground">
                Loading...
              </p>
            ) : history.length === 0 ? (
              <p className="font-mono text-[10px] text-muted-foreground">
                No activity
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="border-l-2 border-border/40 pl-3 py-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-foreground">
                        {entry.event}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {entry.actor}
                      </span>
                    </div>
                    {entry.event === "comment" &&
                      entry.details?.content ? (
                        <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                          {String(entry.details.content)}
                        </p>
                      ) : null}
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
