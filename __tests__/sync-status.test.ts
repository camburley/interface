import { describe, it, expect } from "vitest"
import {
  storyStatusToTaskStatus,
  taskStatusToStoryStatus,
} from "@/lib/sync-status"

describe("storyStatusToTaskStatus", () => {
  it("maps todo to todo", () => {
    expect(storyStatusToTaskStatus("todo")).toBe("todo")
  })

  it("maps in-progress to in_progress", () => {
    expect(storyStatusToTaskStatus("in-progress")).toBe("in_progress")
  })

  it("maps review to review", () => {
    expect(storyStatusToTaskStatus("review")).toBe("review")
  })

  it("maps done to done", () => {
    expect(storyStatusToTaskStatus("done")).toBe("done")
  })

  it("maps blocked to blocked", () => {
    expect(storyStatusToTaskStatus("blocked")).toBe("blocked")
  })
})

describe("taskStatusToStoryStatus", () => {
  it("maps todo to todo", () => {
    expect(taskStatusToStoryStatus("todo")).toBe("todo")
  })

  it("maps in_progress to in-progress", () => {
    expect(taskStatusToStoryStatus("in_progress")).toBe("in-progress")
  })

  it("maps review to review", () => {
    expect(taskStatusToStoryStatus("review")).toBe("review")
  })

  it("maps done to done", () => {
    expect(taskStatusToStoryStatus("done")).toBe("done")
  })

  it("maps blocked to blocked", () => {
    expect(taskStatusToStoryStatus("blocked")).toBe("blocked")
  })

  it("maps backlog to todo (task-only status)", () => {
    expect(taskStatusToStoryStatus("backlog")).toBe("todo")
  })

  it("maps qa to review (task-only status)", () => {
    expect(taskStatusToStoryStatus("qa")).toBe("review")
  })
})
