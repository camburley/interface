import { getFirebaseAdmin } from "./firebase-admin"
import type { Task, TaskStatus, TaskPriority, TaskContext } from "./types/task"

const COUNTER_DOC = "task_id_counter"
const COUNTER_COLLECTION = "counters"

export async function generateTaskId(): Promise<string> {
  const { db } = getFirebaseAdmin()
  const ref = db.collection(COUNTER_COLLECTION).doc(COUNTER_DOC)

  const result = await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref)
    const current = doc.exists ? (doc.data()!.value as number) : 0
    const next = current + 1
    tx.set(ref, { value: next })
    return next
  })

  return `TASK-${String(result).padStart(3, "0")}`
}

export function buildNewTask(
  fields: {
    taskId: string
    title: string
    projectId: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    milestoneId?: string
    parentTaskId?: string
    dependencies?: string[]
    assignee?: string
    owner?: string
    tags?: string[]
    hours?: number
    acceptanceCriteria?: string[]
    definitionOfDone?: string[]
    context?: Partial<TaskContext>
    specUrl?: string
    outputUrl?: string
    dueDate?: string
    sprint?: string
  },
): Omit<Task, "id"> {
  const now = new Date().toISOString()
  return {
    taskId: fields.taskId,
    title: fields.title,
    description: fields.description ?? "",
    status: fields.status ?? "backlog",
    priority: fields.priority ?? "medium",
    projectId: fields.projectId,
    milestoneId: fields.milestoneId ?? null,
    parentTaskId: fields.parentTaskId ?? null,
    dependencies: fields.dependencies ?? [],
    assignee: fields.assignee ?? null,
    owner: fields.owner ?? null,
    tags: fields.tags ?? [],
    hours: fields.hours ?? null,
    acceptanceCriteria: fields.acceptanceCriteria ?? [],
    definitionOfDone: fields.definitionOfDone ?? [],
    artifacts: [],
    context: {
      repo: fields.context?.repo ?? null,
      service: fields.context?.service ?? null,
      files: fields.context?.files ?? [],
      relevantDocs: fields.context?.relevantDocs ?? [],
      recentDecisions: fields.context?.recentDecisions ?? [],
      knownRisks: fields.context?.knownRisks ?? [],
      openQuestions: fields.context?.openQuestions ?? [],
    },
    specUrl: fields.specUrl ?? null,
    outputUrl: fields.outputUrl ?? null,
    dueDate: fields.dueDate ?? null,
    sprint: fields.sprint ?? null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  }
}

export async function appendHistory(
  taskDocId: string,
  entry: {
    actor: string
    event: string
    details?: Record<string, unknown>
    inputs?: string[]
    confidence?: number
  },
) {
  const { db } = getFirebaseAdmin()
  const data = {
    ...entry,
    timestamp: new Date().toISOString(),
  }
  await db.collection("tasks").doc(taskDocId).collection("history").add(data)
}

export async function fetchTasksFromFirestore(filters?: {
  projectId?: string
  milestoneId?: string
  status?: TaskStatus
  assignee?: string
  parentTaskId?: string | null
}): Promise<Task[]> {
  const { db } = getFirebaseAdmin()
  let query: FirebaseFirestore.Query = db.collection("tasks")

  if (filters?.projectId) {
    query = query.where("projectId", "==", filters.projectId)
  }
  if (filters?.milestoneId) {
    query = query.where("milestoneId", "==", filters.milestoneId)
  }
  if (filters?.status) {
    query = query.where("status", "==", filters.status)
  }
  if (filters?.assignee) {
    query = query.where("assignee", "==", filters.assignee)
  }
  if (filters?.parentTaskId !== undefined) {
    query = query.where(
      "parentTaskId",
      "==",
      filters.parentTaskId ?? null,
    )
  }

  const snap = await query.get()
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task))
}

export async function fetchTaskHistory(taskDocId: string) {
  const { db } = getFirebaseAdmin()
  const snap = await db
    .collection("tasks")
    .doc(taskDocId)
    .collection("history")
    .orderBy("timestamp", "desc")
    .get()

  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}
