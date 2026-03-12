import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "@/app/api/admin/tasks/[taskId]/move/route"

const mockStoryUpdate = vi.fn().mockResolvedValue(undefined)

vi.mock("@/lib/api-auth", () => ({
  validateBearerOrAdmin: vi.fn().mockResolvedValue({ authorized: true }),
}))

vi.mock("@/lib/firebase-admin", () => ({
  getFirebaseAdmin: vi.fn(),
}))

vi.mock("@/lib/task-utils", () => ({
  appendHistory: vi.fn().mockResolvedValue(undefined),
}))

async function createMockDb(
  taskId: string,
  storyId: string,
  taskStatus: "todo" | "qa" = "todo",
) {
  const { getFirebaseAdmin } = await import("@/lib/firebase-admin")
  const mockTaskRef = {
    get: vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        id: taskId,
        taskId: "TASK-001",
        title: "Test task",
        status: taskStatus,
        projectId: "p1",
        milestoneId: "m1",
        storyId,
        artifacts: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    }),
    update: vi.fn().mockResolvedValue(undefined),
  }
  const mockStoryRef = {
    get: vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        title: "Test story",
        status: "todo",
        milestoneId: "m1",
        projectId: "p1",
        createdAt: new Date().toISOString(),
      }),
    }),
    update: mockStoryUpdate,
  }
  const mockDb = {
    collection: vi.fn((name: string) => ({
      doc: (id: string) => {
        if (name === "tasks" && id === taskId) return mockTaskRef
        if (name === "stories" && id === storyId) return mockStoryRef
        return { get: vi.fn(), update: vi.fn() }
      },
    })),
  }
  ;(getFirebaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({ db: mockDb })
  return { mockDb, mockTaskRef, mockStoryRef, mockStoryUpdate }
}

describe("POST /api/admin/tasks/[taskId]/move - sync to story", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("updates linked story status when task is moved to in_progress", async () => {
    const taskId = "task-1"
    const storyId = "story-1"
    await createMockDb(taskId, storyId)

    const req = new Request(`http://localhost/api/admin/tasks/${taskId}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in_progress" }),
    })
    const context = { params: Promise.resolve({ taskId }) }

    const res = await POST(req as never, context as never)
    expect(res.status).toBe(200)

    expect(mockStoryUpdate).toHaveBeenCalled()
    const storyUpdatePayload = mockStoryUpdate.mock.calls[0][0]
    expect(storyUpdatePayload).toMatchObject({
      status: "in-progress",
    })
  })

  it("sets story completedAt when task is moved to done", async () => {
    const taskId = "task-1"
    const storyId = "story-1"
    await createMockDb(taskId, storyId, "qa")

    const req = new Request(`http://localhost/api/admin/tasks/${taskId}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done", actor: "admin" }),
    })
    const context = { params: Promise.resolve({ taskId }) }

    const res = await POST(req as never, context as never)
    expect(res.status).toBe(200)

    expect(mockStoryUpdate).toHaveBeenCalled()
    const storyUpdatePayload = mockStoryUpdate.mock.calls[0][0]
    expect(storyUpdatePayload.status).toBe("done")
    expect(storyUpdatePayload.completedAt).toBeDefined()
  })
})
