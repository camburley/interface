import { create } from "zustand"
import type { Task } from "../types/task"

interface ClientTaskStore {
  tasks: Task[]
  loading: boolean

  fetchTasks: () => Promise<void>

  createTask: (data: {
    title: string
    description?: string
    clientDescription?: string
    tags?: string[]
    priority?: "low" | "medium" | "high"
    acceptanceCriteria?: string[]
    definitionOfDone?: string[]
    projectId?: string
  }) => Promise<{ id: string; taskId: string } | null>

  updateTask: (id: string, data: Record<string, unknown>) => Promise<boolean>

  deleteTask: (id: string) => Promise<boolean>

  reorderTasks: (items: { id: string; position: number }[]) => Promise<boolean>

  addComment: (taskId: string, content: string) => Promise<boolean>

  tasksByStatus: (status: string) => Task[]
}

export const useClientTaskStore = create<ClientTaskStore>((set, get) => ({
  tasks: [],
  loading: false,

  fetchTasks: async () => {
    set({ loading: true })
    try {
      const res = await fetch("/api/client/tasks")
      if (!res.ok) throw new Error("Failed to fetch tasks")
      const { tasks } = await res.json()
      set({ tasks, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  createTask: async (data) => {
    try {
      const res = await fetch("/api/client/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          clientDescription: data.clientDescription,
          tags: data.tags,
          priority: data.priority,
          acceptanceCriteria: data.acceptanceCriteria,
          definitionOfDone: data.definitionOfDone,
          projectId: data.projectId,
        }),
      })
      if (!res.ok) return null
      const result = await res.json()

      const now = new Date().toISOString()
      const optimistic: Task = {
        id: result.id,
        taskId: result.taskId,
        title: data.title,
        description: data.description ?? "",
        clientDescription: data.clientDescription,
        status: "todo",
        priority: data.priority ?? "medium",
        projectId: "",
        dependencies: [],
        tags: data.tags ?? [],
        acceptanceCriteria: data.acceptanceCriteria ?? [],
        definitionOfDone: data.definitionOfDone ?? [],
        artifacts: [],
        context: {},
        cardType: "one_off",
        recurrence: undefined,
        position: 99999,
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
    const prev = get().tasks
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t,
      ),
    }))

    try {
      const res = await fetch(`/api/client/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      const res = await fetch(`/api/client/tasks/${id}`, { method: "DELETE" })
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

  reorderTasks: async (items) => {
    const prev = get().tasks
    set((state) => ({
      tasks: state.tasks.map((t) => {
        const match = items.find((i) => i.id === t.id)
        return match ? { ...t, position: match.position } : t
      }),
    }))

    try {
      const res = await fetch("/api/client/tasks/reorder", {
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

  addComment: async (taskId, content) => {
    try {
      const res = await fetch(`/api/client/tasks/${taskId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      return res.ok
    } catch {
      return false
    }
  },

  tasksByStatus: (status) => {
    return get()
      .tasks.filter((t) => t.status === status)
      .sort((a, b) => (a.position ?? 99999) - (b.position ?? 99999))
  },
}))
