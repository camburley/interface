import { describe, it, expect, vi, beforeEach } from "vitest"
import { PATCH } from "@/app/api/admin/milestones/[milestoneId]/stories/[storyId]/route"

const mockTaskUpdate = vi.fn().mockResolvedValue(undefined)

vi.mock("@/lib/api-auth", () => ({
  validateBearerOrAdmin: vi.fn().mockResolvedValue({ authorized: true }),
}))

vi.mock("@/lib/firebase-admin", () => ({
  getFirebaseAdmin: vi.fn(),
}))

async function createMockDb(storyId: string, taskId: string, taskHasStoryId: boolean) {
  const { getFirebaseAdmin } = await import("@/lib/firebase-admin")
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
    update: vi.fn().mockResolvedValue(undefined),
  }
  const mockTaskRef = {
    get: vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        id: taskId,
        taskId: "TASK-001",
        title: "Test story",
        status: "todo",
        projectId: "p1",
        milestoneId: "m1",
        ...(taskHasStoryId ? { storyId } : {}),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    }),
    update: mockTaskUpdate,
  }
  const mockTasksSnapshot = {
    docs: taskHasStoryId
      ? [
          {
            id: taskId,
            ref: mockTaskRef,
            data: () => ({
              id: taskId,
              status: "todo",
              storyId,
              updatedAt: new Date().toISOString(),
            }),
          },
        ]
      : [],
  }
  const mockDb = {
    collection: vi.fn((name: string) => ({
      doc: (id: string) =>
        name === "stories" && id === storyId
          ? mockStoryRef
          : name === "tasks"
            ? mockTaskRef
            : { get: vi.fn(), update: vi.fn() },
      where: vi.fn(() => ({
        get: () => Promise.resolve(mockTasksSnapshot),
      })),
    })),
  }
  ;(getFirebaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({ db: mockDb })
  return { mockDb, mockStoryRef, mockTaskRef, mockTaskUpdate }
}

describe("PATCH /api/admin/milestones/[milestoneId]/stories/[storyId] - sync to task", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("updates linked task status when story status is changed to in-progress", async () => {
    const storyId = "story-1"
    const taskId = "task-1"
    await createMockDb(storyId, taskId, true)

    const req = new Request("http://localhost/api/admin/milestones/m1/stories/story-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in-progress" }),
    })
    const context = {
      params: Promise.resolve({ milestoneId: "m1", storyId }),
    }

    const res = await PATCH(req as never, context as never)
    expect(res.status).toBe(200)

    expect(mockTaskUpdate).toHaveBeenCalled()
    const taskUpdatePayload = mockTaskUpdate.mock.calls[0][0]
    expect(taskUpdatePayload).toMatchObject({
      status: "in_progress",
    })
    expect(taskUpdatePayload.updatedAt).toBeDefined()
  })
})
