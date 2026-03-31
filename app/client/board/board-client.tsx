"use client"

import { useState, useEffect, useCallback } from "react"
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
}

export function ClientBoardClient({
  initialTasks,
  projectName,
  projectColor,
  clientName,
  readOnly = false,
  adminPreview = false,
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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (adminPreview) {
      setShowWelcome(true)
      return
    }
    if (readOnly) return
    const key = `burley_board_welcomed_${clientName}`
    if (!localStorage.getItem(key)) {
      setShowWelcome(true)
    }
  }, [readOnly, adminPreview, clientName])

  function dismissWelcome() {
    if (!adminPreview) {
      const key = `burley_board_welcomed_${clientName}`
      localStorage.setItem(key, "1")
    }
    setShowWelcome(false)
  }

  useEffect(() => {
    useClientTaskStore.setState({ tasks: initialTasks })
    if (!initialized) setInitialized(true)
  }, [initialTasks, initialized])

  useEffect(() => {
    fetchTasks()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchTasks()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [fetchTasks])

  useEffect(() => {
    const interval = setInterval(() => fetchTasks(), 15_000)
    return () => clearInterval(interval)
  }, [fetchTasks])

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    const result = await createTask({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
    })
    setCreating(false)

    if (result) {
      toast.success(`${result.taskId} created`)
      setNewTitle("")
      setNewDescription("")
      setShowCreate(false)
    } else {
      toast.error("Failed to create task")
    }
  }

  const todoCount = columnTasks("todo").length
  const inProgressCount = columnTasks("in_progress").length
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
          <div className="flex items-center gap-2 text-purple-400">
            <span>{reviewCount} review</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>{doneCount} done</span>
          </div>

          {!readOnly && (
            <div className="ml-auto">
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

        {/* Create task panel */}
        {showCreate && !readOnly && (
          <div className="mb-6 border border-primary/30 bg-primary/5 rounded-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-xs text-primary uppercase tracking-widest">
                Add to To Do
              </p>
              <button
                onClick={() => setShowCreate(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
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
                  className="w-full bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  Description (optional)
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Any extra context or details..."
                  className="w-full bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-5 py-2.5 rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {creating ? "Adding..." : "Add Item"}
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
        <DndContext
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

function CardContent({
  task,
  projectColor,
}: {
  task: Task
  projectColor: string
}) {
  const priorityCfg =
    TASK_PRIORITY_CONFIG[task.priority] ?? TASK_PRIORITY_CONFIG.medium

  return (
    <div
      className="border border-border/40 rounded-sm bg-background"
      style={{ borderLeftWidth: "4px", borderLeftColor: projectColor }}
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

          {/* Description */}
          {task.description && (
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                Description
              </p>
              <p className="font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
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
                      entry.details?.content && (
                        <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                          {entry.details.content as string}
                        </p>
                      )}
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
