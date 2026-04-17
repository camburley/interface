import { NextRequest, NextResponse } from "next/server"
import { getSessionUser, isAdmin } from "@/lib/session"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import {
  getDefaultCopy,
  invalidateCopyCache,
  renderWelcomeHtml,
  renderTaskDoneHtml,
  renderTaskReviewHtml,
  renderTaskInProgressHtml,
  renderWeeklySummaryHtml,
  type EmailCopy,
  type TemplateKey,
} from "@/lib/email"

const SAMPLE_VARS = {
  clientName: "Ali Rasheed",
  tierLabel: "Core",
  price: "$4,995",
  taskTitle: "Build scanner page layout",
  projectName: "Scanner Platform",
  week: "2026-W16",
  weekRangeLabel: "Apr 13, 2026 - Apr 17, 2026",
}

function renderPreview(key: TemplateKey, copy: EmailCopy): string {
  switch (key) {
    case "welcome":
      return renderWelcomeHtml(copy, {
        clientName: SAMPLE_VARS.clientName,
        tierLabel: SAMPLE_VARS.tierLabel,
        price: SAMPLE_VARS.price,
      })
    case "task_done":
      return renderTaskDoneHtml(copy, {
        clientName: SAMPLE_VARS.clientName,
        taskTitle: SAMPLE_VARS.taskTitle,
        artifacts: [
          { type: "loom", url: "#", label: "Loom Walkthrough" },
          { type: "deploy", url: "#", label: "Live Preview" },
        ],
        nextTask: { title: "Connect Kalshi API", status: "in_progress" },
      })
    case "task_review":
      return renderTaskReviewHtml(copy, {
        clientName: SAMPLE_VARS.clientName,
        taskTitle: SAMPLE_VARS.taskTitle,
      })
    case "task_in_progress":
      return renderTaskInProgressHtml(copy, {
        clientName: SAMPLE_VARS.clientName,
        taskTitle: SAMPLE_VARS.taskTitle,
      })
    case "weekly_summary":
      return renderWeeklySummaryHtml(copy, {
        clientName: SAMPLE_VARS.clientName,
        projectName: SAMPLE_VARS.projectName,
        week: SAMPLE_VARS.week,
        weekRangeLabel: SAMPLE_VARS.weekRangeLabel,
        completed: [
          {
            title: "Build scanner page layout",
            oneLineSummary: "Shipped responsive dashboard layout and validated key flows.",
            videoUrl: "#",
            prUrl: "#",
          },
          {
            title: "Stripe payment integration",
            oneLineSummary: "Completed checkout lane and webhook handling for subscriptions.",
            videoUrl: "#",
            prUrl: "#",
          },
        ],
        progress: {
          done: 13,
          total: 37,
          percentage: 35,
        },
        upNext: [
          "Add invoice filters for date range exports",
          "Finalize client role permissions",
          "Add analytics summary widget",
        ],
        timelineNote: "Task-based cadence. Up to 48hrs per task. Fluid based on priorities.",
        reportUrl: "https://burley.ai/client/reports/weekly?week=2026-W16",
      })
  }
}

export async function GET() {
  const user = await getSessionUser()
  if (!user || !isAdmin(user.uid))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { db } = getFirebaseAdmin()
  const snap = await db.collection("email_templates").get()
  const overrides: Record<string, Partial<EmailCopy>> = {}
  for (const doc of snap.docs) {
    overrides[doc.id] = doc.data() as Partial<EmailCopy>
  }

  const defaults = getDefaultCopy()
  const templates: Record<string, { copy: EmailCopy; html: string }> = {}

  for (const key of Object.keys(defaults) as TemplateKey[]) {
    const merged = { ...defaults[key], ...overrides[key] }
    templates[key] = {
      copy: merged,
      html: renderPreview(key, merged),
    }
  }

  return NextResponse.json({ templates })
}

export async function PUT(request: NextRequest) {
  const user = await getSessionUser()
  if (!user || !isAdmin(user.uid))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { key, copy } = (await request.json()) as {
    key: TemplateKey
    copy: Partial<EmailCopy>
  }

  const validKeys: TemplateKey[] = [
    "welcome",
    "task_done",
    "task_review",
    "task_in_progress",
    "weekly_summary",
  ]
  if (!validKeys.includes(key)) {
    return NextResponse.json({ error: "Invalid template key" }, { status: 400 })
  }

  const { db } = getFirebaseAdmin()
  const ref = db.collection("email_templates").doc(key)

  const sanitized: Partial<EmailCopy> = {}
  if (typeof copy.subject === "string") sanitized.subject = copy.subject
  if (typeof copy.heading === "string") sanitized.heading = copy.heading
  if (typeof copy.body === "string") sanitized.body = copy.body

  await ref.set(sanitized, { merge: true })
  invalidateCopyCache()

  const defaults = getDefaultCopy()
  const merged = { ...defaults[key], ...sanitized }

  return NextResponse.json({
    ok: true,
    copy: merged,
    html: renderPreview(key, merged),
  })
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser()
  if (!user || !isAdmin(user.uid))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { key, to } = (await request.json()) as {
    key: TemplateKey
    to?: string
  }

  const validKeys: TemplateKey[] = [
    "welcome",
    "task_done",
    "task_review",
    "task_in_progress",
    "weekly_summary",
  ]
  if (!validKeys.includes(key)) {
    return NextResponse.json({ error: "Invalid template key" }, { status: 400 })
  }

  const sendTo = to ?? "cam@burley.ai"

  const { Resend } = await import("resend")
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 500 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { db } = getFirebaseAdmin()
  const snap = await db.collection("email_templates").doc(key).get()
  const defaults = getDefaultCopy()
  const copy = { ...defaults[key], ...(snap.exists ? snap.data() : {}) } as EmailCopy

  const vars = { ...SAMPLE_VARS }
  const html = renderPreview(key, copy)
  const subject = `[TEST] ${copy.subject.replace(/\{\{(\w+)\}\}/g, (_, k: string) => (vars as Record<string, string>)[k] ?? "")}`

  await resend.emails.send({
    from: "Burley <cam@burley.ai>",
    to: sendTo,
    subject,
    html,
  })

  return NextResponse.json({ ok: true, sentTo: sendTo })
}
