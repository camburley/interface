/**
 * Maps between Story (milestone) status and Task (board) status.
 * Used for dual-write sync between milestone screen and board.
 */

import type { StoryStatus } from "@/lib/types/milestone"
import type { TaskStatus } from "@/lib/types/task"

const STORY_TO_TASK: Record<StoryStatus, TaskStatus> = {
  todo: "todo",
  "in-progress": "in_progress",
  review: "review",
  done: "done",
  blocked: "blocked",
}

export function storyStatusToTaskStatus(status: StoryStatus): TaskStatus {
  return STORY_TO_TASK[status]
}

/** Task-only statuses (backlog, qa) map to closest story status. */
const TASK_TO_STORY: Record<TaskStatus, StoryStatus> = {
  backlog: "todo",
  todo: "todo",
  in_progress: "in-progress",
  review: "review",
  qa: "review",
  done: "done",
  blocked: "blocked",
}

export function taskStatusToStoryStatus(status: TaskStatus): StoryStatus {
  return TASK_TO_STORY[status]
}
