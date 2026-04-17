import { Resend } from "resend"
import { getFirebaseAdmin } from "@/lib/firebase-admin"

let resend: Resend | null = null

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

const FROM = "Burley <cam@burley.ai>"
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://burley.ai"

// ---------------------------------------------------------------------------
// Email preferences (stored on the client doc in Firestore)
// ---------------------------------------------------------------------------
export interface EmailPreferences {
  taskDone: boolean
  taskInProgress: boolean
  taskReview: boolean
  weeklySummary: boolean
}

export const DEFAULT_EMAIL_PREFS: EmailPreferences = {
  taskDone: true,
  taskInProgress: false,
  taskReview: true,
  weeklySummary: false,
}

export async function getClientEmailPrefs(clientId: string): Promise<EmailPreferences> {
  const { db } = getFirebaseAdmin()
  const doc = await db.collection("clients").doc(clientId).get()
  if (!doc.exists) return DEFAULT_EMAIL_PREFS
  const prefs = doc.data()?.emailPreferences as Partial<EmailPreferences> | undefined
  return { ...DEFAULT_EMAIL_PREFS, ...prefs }
}

// ---------------------------------------------------------------------------
// Editable email copy — stored in Firestore `email_templates` collection
// ---------------------------------------------------------------------------
export interface EmailCopy {
  subject: string
  heading: string
  body: string
}

export type TemplateKey =
  | "welcome"
  | "task_done"
  | "task_review"
  | "task_in_progress"
  | "weekly_summary"

const DEFAULT_COPY: Record<TemplateKey, EmailCopy> = {
  welcome: {
    subject: "Welcome to Burley — Your {{tierLabel}} lane is live",
    heading: "Welcome to Burley, {{clientName}}.",
    body: "Your board is ready. This is where all your work lives — tasks move through a queue, and you can track everything async.",
  },
  task_done: {
    subject: "✓ Done: {{taskTitle}}",
    heading: "Task Complete",
    body: "Hi {{clientName}} — this task has been completed and is ready for you to check out.",
  },
  task_review: {
    subject: "Update: {{taskTitle}} — In Review",
    heading: "In Team Review",
    body: "Hi {{clientName}} — Cam is kicking the tires on this one, testing with the team to make sure it's ready for production. Nothing needed from you. We'll let you know when it ships.",
  },
  task_in_progress: {
    subject: "In Progress: {{taskTitle}}",
    heading: "Work Started",
    body: "Hi {{clientName}} — work has started on this task. You'll be notified when it moves to review.",
  },
  weekly_summary: {
    subject: "Weekly Summary: {{projectName}} ({{week}})",
    heading: "Weekly Summary",
    body: "Here is your weekly delivery summary with completed work, current progress, and what is up next.",
  },
}

export function getDefaultCopy(): Record<TemplateKey, EmailCopy> {
  return JSON.parse(JSON.stringify(DEFAULT_COPY))
}

export const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  welcome: "Welcome Email",
  task_done: "Task Complete",
  task_review: "In Team Review",
  task_in_progress: "Work Started",
  weekly_summary: "Weekly Summary",
}

let copyCache: Record<TemplateKey, EmailCopy> | null = null
let copyCacheTime = 0
const CACHE_TTL = 60_000

async function loadCopy(): Promise<Record<TemplateKey, EmailCopy>> {
  if (copyCache && Date.now() - copyCacheTime < CACHE_TTL) return copyCache

  try {
    const { db } = getFirebaseAdmin()
    const snap = await db.collection("email_templates").get()
    const overrides: Partial<Record<TemplateKey, Partial<EmailCopy>>> = {}
    for (const doc of snap.docs) {
      overrides[doc.id as TemplateKey] = doc.data() as Partial<EmailCopy>
    }

    const merged = { ...getDefaultCopy() }
    for (const key of Object.keys(merged) as TemplateKey[]) {
      if (overrides[key]) {
        merged[key] = { ...merged[key], ...overrides[key] }
      }
    }

    copyCache = merged
    copyCacheTime = Date.now()
    return merged
  } catch {
    return getDefaultCopy()
  }
}

export function invalidateCopyCache() {
  copyCache = null
  copyCacheTime = 0
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "")
}

// ---------------------------------------------------------------------------
// Shared inline style constants — computed from globals.css oklch tokens
// ---------------------------------------------------------------------------
const F = `'IBM Plex Mono',Menlo,Consolas,'Courier New',monospace`
const FD = `'Bebas Neue',Impact,'Arial Black',sans-serif`
const BG = "#020202"    // oklch(0.08 0 0) — background
const BG2 = "#060606"   // oklch(0.12 0 0) — card
const BG3 = "#121212"   // oklch(0.18 0 0) — secondary
const FG = "#eeeeee"    // oklch(0.95 0 0) — foreground
const FG2 = "#a0a0a0"   // between muted-fg and foreground
const FG3 = "#717171"   // oklch(0.55 0 0) — muted-foreground
const BORDER = "#222222" // oklch(0.25 0 0) — border
const ACCENT = "#fe6a00" // oklch(0.7 0.2 45) — accent
const GREEN = "#34d399"
const PURPLE = "#a855f7"
const AMBER = "#facc15"

// ---------------------------------------------------------------------------
// Branded HTML wrapper — table-based, fully inline, Google Fonts linked
// ---------------------------------------------------------------------------
function brandedHtml(body: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta name="color-scheme" content="dark"/>
<meta name="supported-color-schemes" content="dark"/>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Bebas+Neue&display=swap" rel="stylesheet"/>
<title>Burley</title>
<!--[if mso]><style>*{font-family:Consolas,'Courier New',monospace!important}</style><![endif]-->
<style>
  body,table,td,p,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  table,td{mso-table-lspace:0;mso-table-rspace:0}
  img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none}
  @media only screen and (max-width:620px){
    .outer{width:100%!important}
    .inner{padding:28px 20px!important}
    .mob-full{width:100%!important;display:block!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${BG};width:100%">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG}">
<tr><td align="center" style="padding:0">

<!-- Outer container -->
<table role="presentation" class="outer" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

<!-- Top accent bar -->
<tr><td style="height:3px;background:linear-gradient(90deg,${ACCENT},${ACCENT}66,transparent);font-size:0;line-height:0">&nbsp;</td></tr>

<!-- Header -->
<tr><td class="inner" style="padding:32px 40px 24px;background-color:${BG2};border-left:1px solid ${BORDER};border-right:1px solid ${BORDER}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td><a href="${BASE_URL}" style="font-family:${FD};font-size:24px;letter-spacing:3px;color:${FG};text-decoration:none">BURLEY</a></td>
    <td align="right"><span style="font-family:${F};font-size:9px;text-transform:uppercase;letter-spacing:2px;color:${FG3}">Client Portal</span></td>
  </tr>
  </table>
</td></tr>

<!-- Divider -->
<tr><td style="padding:0 40px;background-color:${BG2};border-left:1px solid ${BORDER};border-right:1px solid ${BORDER}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid ${BORDER};font-size:0;line-height:0;height:1px">&nbsp;</td></tr></table>
</td></tr>

<!-- Body -->
<tr><td class="inner" style="padding:32px 40px 40px;background-color:${BG2};border-left:1px solid ${BORDER};border-right:1px solid ${BORDER}">
  ${body}
</td></tr>

<!-- Footer divider -->
<tr><td style="padding:0 40px;background-color:${BG2};border-left:1px solid ${BORDER};border-right:1px solid ${BORDER}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid ${BORDER};font-size:0;line-height:0;height:1px">&nbsp;</td></tr></table>
</td></tr>

<!-- Footer -->
<tr><td class="inner" style="padding:24px 40px 32px;background-color:${BG2};border-left:1px solid ${BORDER};border-right:1px solid ${BORDER}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="font-family:${F};font-size:10px;text-transform:uppercase;letter-spacing:2px;color:${FG3};padding-bottom:12px">Burley · Async development, subscribed.</td></tr>
  <tr><td style="font-family:${F};font-size:11px;line-height:22px">
    <a href="${BASE_URL}/client/dashboard" style="color:${FG3};text-decoration:none">Dashboard</a>
    <span style="color:${BORDER};padding:0 8px">·</span>
    <a href="${BASE_URL}/client/board" style="color:${FG3};text-decoration:none">Board</a>
    <span style="color:${BORDER};padding:0 8px">·</span>
    <a href="${BASE_URL}/client/settings" style="color:${FG3};text-decoration:none">Email preferences</a>
    <span style="color:${BORDER};padding:0 8px">·</span>
    <a href="mailto:cam@burley.ai" style="color:${ACCENT};text-decoration:none">cam@burley.ai</a>
  </td></tr>
  </table>
</td></tr>

<!-- Bottom accent bar -->
<tr><td style="height:2px;background:${BORDER};font-size:0;line-height:0">&nbsp;</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Reusable email component builders
// ---------------------------------------------------------------------------
function emailHeading(text: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family:${FD};font-size:34px;letter-spacing:1px;color:${FG};padding-bottom:4px;line-height:1.1">${text}</td></tr></table>`
}

function emailTag(text: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:12px;margin-bottom:20px"><tr><td style="font-family:${F};font-size:9px;text-transform:uppercase;letter-spacing:3px;color:${ACCENT};border:1px solid ${ACCENT}44;padding:4px 14px">${text}</td></tr></table>`
}

function emailCard(label: string, value: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">
  <tr><td style="background-color:${BG3};border:1px solid ${BORDER};padding:20px 24px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="font-family:${F};font-size:9px;text-transform:uppercase;letter-spacing:3px;color:${FG3};padding-bottom:10px">${label}</td></tr>
    <tr><td style="font-family:${F};font-size:18px;color:${FG};font-weight:600;line-height:1.3">${value}</td></tr>
    </table>
  </td></tr>
  </table>`
}

function emailParagraph(text: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family:${F};font-size:13px;line-height:1.8;color:${FG2};padding-bottom:16px">${text}</td></tr></table>`
}

function emailSectionLabel(text: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px"><tr><td style="font-family:${F};font-size:9px;text-transform:uppercase;letter-spacing:3px;color:${FG3};padding-bottom:12px">${text}</td></tr></table>`
}

function emailButton(text: string, href: string, primary = true): string {
  if (primary) {
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 8px 6px 0;display:inline-block">
    <tr><td style="background-color:${ACCENT};padding:13px 28px">
      <a href="${href}" style="font-family:${F};font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:3px;color:${BG};text-decoration:none;display:block">${text}</a>
    </td></tr>
    </table>`
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 8px 6px 0;display:inline-block">
  <tr><td style="border:1px solid ${BORDER};padding:12px 24px">
    <a href="${href}" style="font-family:${F};font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:2px;color:${FG2};text-decoration:none;display:block">${text}</a>
  </td></tr>
  </table>`
}

function emailStatusBadge(text: string, color: string): string {
  const bgAlpha = color === GREEN ? "0d" : color === PURPLE ? "14" : "14"
  const borderAlpha = "33"
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:12px 0 16px">
  <tr><td style="font-family:${F};font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:${color};background-color:${color}${bgAlpha};border:1px solid ${color}${borderAlpha};padding:5px 14px">${text}</td></tr>
  </table>`
}

function emailNextUp(title: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">
  <tr><td style="background-color:${BG3};border-left:3px solid ${ACCENT};padding:16px 20px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="font-family:${F};font-size:9px;text-transform:uppercase;letter-spacing:2px;color:${FG3};padding-bottom:6px">Up next</td></tr>
    <tr><td style="font-family:${F};font-size:13px;color:${FG};font-weight:600">${title}</td></tr>
    </table>
  </td></tr>
  </table>`
}

function emailStep(num: string, title: string, desc: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
  <tr>
    <td width="28" valign="top" style="font-family:${FD};font-size:18px;color:${ACCENT};padding-right:12px;line-height:1">${num}</td>
    <td valign="top">
      <span style="font-family:${F};font-size:12px;font-weight:600;color:${FG};display:block;margin-bottom:4px">${title}</span>
      <span style="font-family:${F};font-size:12px;color:${FG3};line-height:1.6">${desc}</span>
    </td>
  </tr>
  </table>`
}

function emailLink(text: string, href: string): string {
  return `<a href="${href}" style="font-family:${F};font-size:12px;color:${ACCENT};text-decoration:none;display:block;padding:4px 0">→ ${text}</a>`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export interface WeeklySummaryTaskEntry {
  title: string
  oneLineSummary: string
  videoUrl?: string | null
  prUrl?: string | null
}

export interface WeeklySummaryEmailData {
  clientName: string
  projectName: string
  week: string
  weekRangeLabel: string
  completed: WeeklySummaryTaskEntry[]
  progress: { done: number; total: number; percentage: number }
  upNext: string[]
  timelineNote: string
  reportUrl: string
}

function emailProgressBar(percentage: number): string {
  const clamped = Math.max(0, Math.min(100, percentage))
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px">
  <tr><td style="border:1px solid ${BORDER};padding:2px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="height:8px;background-color:${ACCENT};width:${clamped}%"></td>
        <td style="height:8px;background-color:${BG3};width:${100 - clamped}%"></td>
      </tr>
    </table>
  </td></tr>
  </table>`
}

export function renderWeeklySummaryHtml(
  copy: EmailCopy,
  vars: WeeklySummaryEmailData,
): string {
  const shippedCount = vars.completed.length
  const shippedTitles = vars.completed.slice(0, 2).map((task) => task.title)
  const paceLabel = vars.progress.total === 0
    ? "Pace is neutral while the queue is being shaped."
    : vars.progress.percentage >= 65
      ? "Pace is ahead of plan."
      : vars.progress.percentage >= 35
        ? "Pace is on plan."
        : "Pace is behind plan and needs focus."

  const summary = shippedCount === 0
    ? `No tasks moved to done this week for ${vars.projectName}, and focus stayed on in-flight work and queue setup. ${paceLabel}`
    : `${shippedCount} task${shippedCount === 1 ? "" : "s"} shipped this week for ${vars.projectName}. Key product movement included ${shippedTitles.join(" and ")}. ${paceLabel}`

  const completedRows = vars.completed.length > 0
    ? vars.completed
      .map((task) => {
        const links = [
          task.videoUrl
            ? `<a href="${task.videoUrl}" style="font-family:${F};font-size:11px;color:${ACCENT};text-decoration:none">Video</a>`
            : "",
          task.prUrl
            ? `<a href="${task.prUrl}" style="font-family:${F};font-size:11px;color:${ACCENT};text-decoration:none">PR</a>`
            : "",
        ]
          .filter(Boolean)
          .join(`<span style="color:${BORDER};padding:0 6px">·</span>`)

        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px">
        <tr><td style="border:1px solid ${BORDER};background-color:${BG3};padding:12px 14px">
          <div style="font-family:${F};font-size:9px;color:${FG3};text-transform:uppercase;letter-spacing:2px;line-height:1.5">Shipped this week</div>
          <div style="font-family:${F};font-size:13px;color:${FG};font-weight:600;line-height:1.5;margin-top:4px">${escapeHtml(task.title)}</div>
          <div style="font-family:${F};font-size:12px;color:${FG2};line-height:1.7;margin-top:6px">${escapeHtml(task.oneLineSummary)}</div>
          ${links ? `<div style="margin-top:8px">${links}</div>` : ""}
        </td></tr>
      </table>`
      })
      .join("")
    : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px">
      <tr><td style="border:1px solid ${BORDER};background-color:${BG3};padding:12px 14px;font-family:${F};font-size:11px;color:${FG3}">
        No tasks were completed this week.
      </td></tr>
    </table>`

  const upNextRows = vars.upNext.length > 0
    ? vars.upNext
      .map(
        (title, index) =>
          `<tr>
          <td width="18" valign="top" style="font-family:${F};font-size:11px;color:${FG3};padding-bottom:6px">${index + 1}.</td>
          <td valign="top" style="font-family:${F};font-size:11px;color:${FG};padding-bottom:6px">${escapeHtml(title)}</td>
        </tr>`,
      )
      .join("")
    : `<tr><td style="font-family:${F};font-size:11px;color:${FG3}">No queued tasks right now.</td></tr>`

  return brandedHtml(`
  ${emailHeading(interpolate(copy.heading, { clientName: vars.clientName }))}
  ${emailTag(`${vars.projectName} · ${vars.weekRangeLabel}`)}
  ${emailParagraph(interpolate(copy.body, { clientName: vars.clientName, projectName: vars.projectName, week: vars.week }))}
  ${emailParagraph(summary)}

  ${emailSectionLabel("Completed this week")}
  ${completedRows}

  ${emailSectionLabel("Progress")}
  ${emailCard("This Week", `${vars.progress.done} task${vars.progress.done === 1 ? "" : "s"} shipped. ${vars.progress.total - vars.progress.done} remaining in the queue.`)}
  ${emailProgressBar(vars.progress.percentage)}

  ${emailSectionLabel("Up next")}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};background-color:${BG3};padding:12px 14px">
    ${upNextRows}
  </table>

  ${emailSectionLabel("Timeline note")}
  ${emailParagraph(vars.timelineNote)}

  ${emailParagraph(`Optional reference link: <a href="${vars.reportUrl}" style="color:${ACCENT};text-decoration:none">Weekly report archive</a>`)}
  `)
}

// ---------------------------------------------------------------------------
// Send email (internal)
// ---------------------------------------------------------------------------
const ADMIN_BCC = "bob@burley.ai"

async function send(to: string, subject: string, html: string): Promise<boolean> {
  const r = getResend()
  if (!r) {
    console.log(`[email skip] RESEND_API_KEY not set. Would have sent to ${to}: ${subject}`)
    return false
  }
  try {
    await r.emails.send({ from: FROM, to, subject, html, bcc: ADMIN_BCC })
    console.log(`[email sent] to=${to} subject="${subject}"`)
    return true
  } catch (err) {
    console.error("[email error]", err)
    return false
  }
}

// ---------------------------------------------------------------------------
// Plain text fallback (keep backward compat)
// ---------------------------------------------------------------------------
export async function sendClientEmail(to: string, subject: string, body: string): Promise<boolean> {
  const r = getResend()
  if (!r) {
    console.log(`[email skip] RESEND_API_KEY not set. Would have sent to ${to}: ${subject}`)
    return false
  }
  try {
    await r.emails.send({ from: FROM, to, subject, text: body })
    console.log(`[email sent] to=${to} subject="${subject}"`)
    return true
  } catch (err) {
    console.error("[email error]", err)
    return false
  }
}

// ---------------------------------------------------------------------------
// HTML renderers (exported for admin preview)
// ---------------------------------------------------------------------------
export function renderWelcomeHtml(
  copy: EmailCopy,
  vars: { clientName: string; tierLabel: string; price: string },
): string {
  const v = { ...vars }
  return brandedHtml(`
  ${emailHeading(interpolate(copy.heading, v))}
  ${emailTag("Your lane is live")}
  ${emailCard("Subscription", `<span style="color:${ACCENT}">${v.tierLabel}</span> · ${v.price}/month`)}
  ${emailParagraph(interpolate(copy.body, v))}
  ${emailSectionLabel("How it works")}
  ${emailStep("1", "Add tasks to your queue", "Drop requests into your To Do column. Reorder anytime to set priority.")}
  ${emailStep("2", "Work moves through", "Tasks move from To Do → In Progress → Review → Done. You'll get notified at each step.")}
  ${emailStep("3", "We kick the tires", "When work moves to Review, Cam and the team test it to make sure it's production-ready. Once it passes, it ships.")}

  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0">
  <tr><td>
    ${emailButton("Open Your Board", `${BASE_URL}/client/board`)}
    ${emailButton("View Dashboard", `${BASE_URL}/client/dashboard`, false)}
  </td></tr>
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px"><tr><td style="border-top:1px solid ${BORDER};font-size:0;height:1px">&nbsp;</td></tr></table>

  ${emailSectionLabel("Quick links")}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td>
    ${emailLink("Your Board", `${BASE_URL}/client/board`)}
    ${emailLink("Dashboard & Subscription", `${BASE_URL}/client/dashboard`)}
    ${emailLink("Email Preferences", `${BASE_URL}/client/settings`)}
    ${emailLink("Email Cam directly", "mailto:cam@burley.ai")}
  </td></tr>
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px"><tr><td style="font-family:${F};font-size:11px;color:${FG3};line-height:1.7">You're set up for async delivery. No meetings required — just add tasks, and work moves through the queue. Standard-sized items turn around within 48 business hours.</td></tr></table>
  `)
}

export function renderTaskDoneHtml(
  copy: EmailCopy,
  vars: {
    clientName: string
    taskTitle: string
    artifacts: { type: string; url: string; label?: string }[]
    nextTask?: { title: string; status: string } | null
  },
): string {
  const v = { clientName: vars.clientName, taskTitle: vars.taskTitle }

  const artifactSection = vars.artifacts.length > 0
    ? `${emailSectionLabel("Deliverables")}
       <table role="presentation" cellpadding="0" cellspacing="0"><tr><td>
       ${vars.artifacts.map(a => emailButton(a.label ?? a.type, a.url, false)).join("")}
       </td></tr></table>`
    : ""

  const nextUpSection = vars.nextTask ? emailNextUp(vars.nextTask.title) : ""

  return brandedHtml(`
  ${emailHeading(interpolate(copy.heading, v))}
  ${emailCard("Completed", vars.taskTitle)}
  ${emailStatusBadge("Done", GREEN)}
  ${emailParagraph(interpolate(copy.body, v))}
  ${artifactSection}

  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0">
  <tr><td>
    ${emailButton("View on Board", `${BASE_URL}/client/board`)}
    ${emailButton("Leave Feedback", `${BASE_URL}/client/board`, false)}
  </td></tr>
  </table>

  ${nextUpSection}
  `)
}

export function renderTaskReviewHtml(
  copy: EmailCopy,
  vars: { clientName: string; taskTitle: string },
): string {
  return brandedHtml(`
  ${emailHeading(interpolate(copy.heading, vars))}
  ${emailCard("Being tested", vars.taskTitle)}
  ${emailStatusBadge("In Review", PURPLE)}
  ${emailParagraph(interpolate(copy.body, vars))}

  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0">
  <tr><td>
    ${emailButton("View Board", `${BASE_URL}/client/board`, false)}
  </td></tr>
  </table>
  `)
}

export function renderTaskInProgressHtml(
  copy: EmailCopy,
  vars: { clientName: string; taskTitle: string },
): string {
  return brandedHtml(`
  ${emailHeading(interpolate(copy.heading, vars))}
  ${emailCard("Now in progress", vars.taskTitle)}
  ${emailStatusBadge("In Progress", AMBER)}
  ${emailParagraph(interpolate(copy.body, vars))}

  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0">
  <tr><td>
    ${emailButton("View Board", `${BASE_URL}/client/board`, false)}
  </td></tr>
  </table>
  `)
}

// ---------------------------------------------------------------------------
// Send functions (load copy from Firestore, render, send)
// ---------------------------------------------------------------------------
export async function sendWelcomeEmail(
  to: string,
  clientName: string,
  tierLabel: string,
  price: string,
): Promise<boolean> {
  const allCopy = await loadCopy()
  const copy = allCopy.welcome
  const vars = { clientName, tierLabel, price }
  const html = renderWelcomeHtml(copy, vars)
  const subject = interpolate(copy.subject, vars)
  return send(to, subject, html)
}

export async function sendTaskDoneEmail(
  to: string,
  clientName: string,
  taskTitle: string,
  taskId: string,
  artifacts: { type: string; url: string; label?: string }[],
  nextTask?: { title: string; status: string } | null,
): Promise<boolean> {
  const allCopy = await loadCopy()
  const copy = allCopy.task_done
  const vars = { clientName, taskTitle }
  const html = renderTaskDoneHtml(copy, { ...vars, artifacts, nextTask })
  const subject = interpolate(copy.subject, vars)
  return send(to, subject, html)
}

export async function sendTaskReviewEmail(
  to: string,
  clientName: string,
  taskTitle: string,
  taskId: string,
): Promise<boolean> {
  const allCopy = await loadCopy()
  const copy = allCopy.task_review
  const vars = { clientName, taskTitle }
  const html = renderTaskReviewHtml(copy, vars)
  const subject = interpolate(copy.subject, vars)
  return send(to, subject, html)
}

export async function sendTaskInProgressEmail(
  to: string,
  clientName: string,
  taskTitle: string,
): Promise<boolean> {
  const allCopy = await loadCopy()
  const copy = allCopy.task_in_progress
  const vars = { clientName, taskTitle }
  const html = renderTaskInProgressHtml(copy, vars)
  const subject = interpolate(copy.subject, vars)
  return send(to, subject, html)
}

export async function sendWeeklySummaryEmail(
  to: string,
  vars: WeeklySummaryEmailData,
): Promise<boolean> {
  const allCopy = await loadCopy()
  const copy = allCopy.weekly_summary
  const html = renderWeeklySummaryHtml(copy, vars)
  const subject = interpolate(copy.subject, {
    clientName: vars.clientName,
    projectName: vars.projectName,
    week: vars.week,
  })
  return send(to, subject, html)
}
