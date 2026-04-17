import { NextRequest, NextResponse } from "next/server"
import { getSessionUser, isAdmin } from "@/lib/session"
import {
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
        projectName: "DME Engine",
        week: "2026-W16",
        weekRangeLabel: "Apr 13, 2026 - Apr 17, 2026",
        completed: [
          {
            title: "Payment Gate + Plan Selection",
            oneLineSummary: "Built checkout entry and plan selection flow with validated guard rails.",
            videoUrl: "#",
            prUrl: "#",
          },
          {
            title: "Phase 1 Flow Restructure",
            oneLineSummary: "Refined handoff screens and state transitions across the onboarding flow.",
            videoUrl: "#",
            prUrl: "#",
          },
        ],
        progress: { done: 13, total: 37, percentage: 35 },
        upNext: [
          "Endowed Progress Entry Screen",
          "Core Lock: Decision Makers updates",
          "Core Lock: Guardianship section",
        ],
        timelineNote: "Task-based cadence. Up to 48hrs per task. Fluid based on priorities.",
        reportUrl: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://burley.ai"}/client/reports/weekly?week=2026-W16`,
      })
  }
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser()
  if (!user || !isAdmin(user.uid))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { key, copy } = (await request.json()) as {
    key: TemplateKey
    copy: EmailCopy
  }

  const validKeys: TemplateKey[] = [
    "welcome",
    "task_done",
    "task_review",
    "task_in_progress",
    "weekly_summary",
  ]
  if (!validKeys.includes(key) || !copy) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const html = renderPreview(key, copy)
  return NextResponse.json({ html })
}
