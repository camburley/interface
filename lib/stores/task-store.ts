import { create } from "zustand"
import type {
  Task,
  TaskStatus,
  TaskPriority,
  CardType,
  RecurrenceFrequency,
} from "../types/task"
import { computeNextDue } from "../types/task"

interface TaskFilters {
  projectId?: string
  status?: TaskStatus
  search?: string
  assignee?: string
}

interface TaskStore {
  tasks: Task[]
  loading: boolean
  filters: TaskFilters

  setFilters: (filters: Partial<TaskFilters>) => void
  clearFilters: () => void

  fetchTasks: (projectId?: string) => Promise<void>

  createTask: (data: {
    title: string
    projectId: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    milestoneId?: string
    tags?: string[]
    hours?: number
    assignee?: string
    acceptanceCriteria?: string[]
    definitionOfDone?: string[]
    specUrl?: string
    outputUrl?: string
    dueDate?: string
    sprint?: string
    cardType?: CardType
    recurrenceFrequency?: RecurrenceFrequency
    targetCount?: number
  }) => Promise<{ id: string; taskId: string } | null>

  updateTask: (
    id: string,
    data: Partial<Task>,
  ) => Promise<boolean>

  moveTask: (
    id: string,
    newStatus: TaskStatus,
    actor?: string,
    comment?: string,
  ) => Promise<boolean>

  deleteTask: (id: string) => Promise<boolean>

  reorderTasks: (items: { id: string; position: number }[]) => Promise<boolean>

  filteredTasks: () => Task[]
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  filters: {},

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  clearFilters: () => set({ filters: {} }),

  fetchTasks: async (projectId?: string) => {
    set({ loading: true })
    try {
      const params = new URLSearchParams()
      if (projectId) params.set("projectId", projectId)

      const res = await fetch(`/api/admin/tasks?${params}`)
      if (!res.ok) throw new Error("Failed to fetch tasks")
      const { tasks } = await res.json()
      set({ tasks, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  createTask: async (data) => {
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) return null
      const result = await res.json()

      const now = new Date().toISOString()
      const cardType: CardType = data.cardType ?? "one_off"
      const optimistic: Task = {
        id: result.id,
        taskId: result.taskId,
        title: data.title,
        description: data.description ?? "",
        status: cardType === "standing" ? "in_progress" : (data.status ?? "backlog"),
        priority: data.priority ?? "medium",
        projectId: data.projectId,
        milestoneId: data.milestoneId,
        dependencies: [],
        assignee: data.assignee,
        tags: data.tags ?? [],
        hours: data.hours,
        acceptanceCriteria: data.acceptanceCriteria ?? [],
        definitionOfDone: data.definitionOfDone ?? [],
        artifacts: [],
        context: {},
        specUrl: data.specUrl,
        outputUrl: data.outputUrl,
        dueDate: data.dueDate,
        sprint: data.sprint,
        cardType,
        recurrence:
          cardType === "recurring" && data.recurrenceFrequency
            ? {
                frequency: data.recurrenceFrequency,
                nextDue: computeNextDue(data.recurrenceFrequency),
                lastCompleted: null,
                streak: 0,
                completionLog: [],
                todayCount: 0,
                targetCount: data.targetCount ?? null,
                lastReset: new Date().toISOString().slice(0, 10),
              }
            : undefined,
        createdAt: now,
        updatedAt: now,
      }

      set((state) => ({ tasks: [optimistic, ...state.tasks] }))
      return { id: result.id, taskId: result.taskId }
    } catch {
      return null
    }
  },

  updateTask: async (id, data) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t,
      ),
    }))

    try {
      const res = await fetch(`/api/admin/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return res.ok
    } catch {
      return false
    }
  },

  moveTask: async (id, newStatus, actor, comment) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return false

    const previousStatus = task.status
    const now = new Date().toISOString()
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id !== id) return t
        const updated: Task = {
          ...t,
          status: newStatus,
          updatedAt: now,
          completedAt: newStatus === "done" ? now : t.completedAt,
        }
        if (
          newStatus === "done" &&
          t.cardType === "recurring" &&
          t.recurrence
        ) {
          const newStreak = (t.recurrence.streak ?? 0) + 1
          const entry = {
            completedAt: now,
            actor: actor ?? "admin",
            comment: comment ?? "",
            cycleNumber: newStreak,
          }
          updated.recurrence = {
            ...t.recurrence,
            lastCompleted: now,
            streak: newStreak,
            nextDue: computeNextDue(t.recurrence.frequency),
            todayCount: (t.recurrence.todayCount ?? 0) + 1,
            completionLog: [...(t.recurrence.completionLog ?? []), entry],
          }
        }
        return updated
      }),
    }))

    try {
      const payload: Record<string, unknown> = {
        status: newStatus,
        actor: actor ?? "admin",
      }
      if (comment) payload.comment = comment

      const res = await fetch(`/api/admin/tasks/${id}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        console.error("[moveTask] API error:", res.status, body)
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: previousStatus } : t,
          ),
        }))
        return false
      }

      return true
    } catch (err) {
      console.error("[moveTask] fetch error:", err)
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, status: previousStatus } : t,
        ),
      }))
      return false
    }
  },

  reorderTasks: async (items) => {
    // Optimistic update
    const prev = get().tasks
    set((state) => ({
      tasks: state.tasks.map((t) => {
        const match = items.find((i) => i.id === t.id)
        return match ? { ...t, position: match.position } : t
      }),
    }))

    try {
      const res = await fetch("/api/admin/tasks/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })
      if (!res.ok) {
        set({ tasks: prev })
        return false
      }
      return true
    } catch {
      set({ tasks: prev })
      return false
    }
  },

  deleteTask: async (id) => {
    const prev = get().tasks
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))

    try {
      const res = await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" })
      if (!res.ok) {
        set({ tasks: prev })
        return false
      }
      return true
    } catch {
      set({ tasks: prev })
      return false
    }
  },

  filteredTasks: () => {
    const { tasks, filters } = get()
    return tasks.filter((t) => {
      if (filters.projectId && t.projectId !== filters.projectId) return false
      if (filters.status && t.status !== filters.status) return false
      if (filters.assignee && t.assignee !== filters.assignee) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const match =
          t.title.toLowerCase().includes(q) ||
          t.taskId.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
        if (!match) return false
      }
      return true
    })
  },
}))
