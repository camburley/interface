import { create } from "zustand"
import type { BoardProject } from "../types/task"
import { PROJECT_COLORS } from "../types/task"

export interface TrackerMilestone {
  id: string
  title: string
  status: "draft" | "active" | "completed" | "on-hold"
  amount: number
  includeInTotals?: boolean
  fundingStatus: string
  order: number
  storyCount: number
  completedStoryCount: number
}

export interface TrackerProject {
  id: string
  clientName: string
  projectName: string
  color: string
  milestones: TrackerMilestone[]
  taskCounts: {
    total: number
    done: number
    inProgress: number
    blocked: number
  }
  totalBudget: number
  funded: number
  completed: number
  completedMilestoneCount: number
  lastActivity?: string
}

interface ProjectStore {
  projects: TrackerProject[]
  boardProjects: BoardProject[]
  loading: boolean

  fetchProjects: () => Promise<void>
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  boardProjects: [],
  loading: false,

  fetchProjects: async () => {
    set({ loading: true })
    try {
      const res = await fetch("/api/admin/tasks/projects")
      if (!res.ok) throw new Error("Failed to fetch projects")
      const data = await res.json()

      set({
        projects: data.projects,
        boardProjects: data.projects.map(
          (p: TrackerProject, i: number) => ({
            id: p.id,
            name: p.projectName,
            color: p.color || PROJECT_COLORS[i % PROJECT_COLORS.length],
            clientName: p.clientName,
          }),
        ),
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },
}))
