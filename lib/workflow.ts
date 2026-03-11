import type { Task, TaskStatus } from "./types/task"

export interface TransitionRule {
  allowedNext: TaskStatus[]
  entryRequirements?: ((task: Task) => { ok: boolean; reason?: string })[]
  transitionRoles?: string[]
}

export const WORKFLOW: Record<TaskStatus, TransitionRule> = {
  backlog: {
    allowedNext: ["todo", "blocked"],
  },
  todo: {
    allowedNext: ["in_progress", "blocked"],
  },
  in_progress: {
    allowedNext: ["review", "blocked", "todo"],
  },
  review: {
    allowedNext: ["qa", "in_progress", "blocked"],
    entryRequirements: [
      (task) => {
        const hasPrOrOutput =
          task.artifacts.some((a) => a.type === "github_pr") ||
          !!task.outputUrl
        return hasPrOrOutput
          ? { ok: true }
          : { ok: false, reason: "Review requires a PR link or output URL" }
      },
    ],
  },
  qa: {
    allowedNext: ["done", "in_progress", "blocked"],
    transitionRoles: ["qa-agent", "lead-agent", "admin"],
  },
  done: {
    allowedNext: ["todo"],
  },
  blocked: {
    allowedNext: ["todo", "in_progress", "backlog"],
  },
}

export interface TransitionResult {
  valid: boolean
  errors: string[]
}

export function validateTransition(
  task: Task,
  newStatus: TaskStatus,
  actor?: string,
): TransitionResult {
  const rule = WORKFLOW[task.status]
  const errors: string[] = []

  if (!rule.allowedNext.includes(newStatus)) {
    errors.push(
      `Cannot transition from "${task.status}" to "${newStatus}". Allowed: ${rule.allowedNext.join(", ")}`,
    )
    return { valid: false, errors }
  }

  const targetRule = WORKFLOW[newStatus]

  if (targetRule.entryRequirements) {
    for (const check of targetRule.entryRequirements) {
      const result = check(task)
      if (!result.ok) {
        errors.push(result.reason ?? "Entry requirement not met")
      }
    }
  }

  if (targetRule.transitionRoles && actor) {
    if (!targetRule.transitionRoles.includes(actor) && actor !== "admin") {
      errors.push(
        `Actor "${actor}" is not authorized. Required roles: ${targetRule.transitionRoles.join(", ")}`,
      )
    }
  }

  return { valid: errors.length === 0, errors }
}

export function getValidTransitions(task: Task): TaskStatus[] {
  const rule = WORKFLOW[task.status]
  return rule.allowedNext.filter((next) => {
    const result = validateTransition(task, next)
    return result.valid
  })
}
