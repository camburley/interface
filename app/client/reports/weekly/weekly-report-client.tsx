"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  AlertTriangle,
  ExternalLink,
  PlayCircle,
} from "lucide-react"
import type {
  WeeklyCompletedTask,
  WeeklyReportPayload,
} from "@/lib/weekly-report"

interface Props {
  report: WeeklyReportPayload
}



function buildExecutiveSummary(report: WeeklyReportPayload): string {
  const shippedCount = report.completed.length
  const titles = report.completed.slice(0, 2).map((task) => task.title)
  const shippedLine =
    shippedCount === 0
      ? `No tasks moved to done during ${report.weekRangeLabel}, and the focus was on in-flight work and queue preparation.`
      : `${shippedCount} task${shippedCount === 1 ? "" : "s"} shipped during ${report.weekRangeLabel} for ${report.projectName}.`

  const changedLine =
    titles.length > 0
      ? `The biggest product movement this week was ${titles.join(" and ")}, with implementation details captured directly from PR narratives and commit history.`
      : "The major product changes this week are outlined in the shipped section below with direct narrative recaps."

  const blockerLine =
    report.blocked.length > 0
      ? `${report.blocked.length} blocker${report.blocked.length === 1 ? "" : "s"} still need attention to keep delivery speed high.`
      : "There are no active blockers right now, so execution can continue without external dependencies."

  return `${shippedLine} ${changedLine} ${blockerLine}`
}

function toNarrativeBlocks(whatWasDone: string): string[] {
  return whatWasDone
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .slice(0, 3)
}

function TaskVideo({ task }: { task: WeeklyCompletedTask }) {
  if (!task.video) return null

  const isDirectVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(task.video.url)

  if (task.video.embedUrl) {
    return (
      <div className="mt-4 border border-border/60 bg-card">
        <div className="aspect-video">
          <iframe
            src={task.video.embedUrl}
            title={`${task.title} demo`}
            className="h-full w-full"
            allowFullScreen
          />
        </div>
        <div className="border-t border-border/60 px-3 py-2.5">
          <a
            href={task.video.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-accent hover:underline"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            {task.video.label}
          </a>
        </div>
      </div>
    )
  }

  if (isDirectVideo) {
    return (
      <div className="mt-4 border border-border/60 bg-card p-2">
        <video
          controls
          preload="metadata"
          className="aspect-video w-full bg-black"
          src={task.video.url}
        />
      </div>
    )
  }

  return (
    <a
      href={task.video.url}
      target="_blank"
      rel="noreferrer"
      className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] text-accent hover:underline"
    >
      <PlayCircle className="h-3.5 w-3.5" />
      {task.video.label}
    </a>
  )
}

function ShippedNarrative({ task }: { task: WeeklyCompletedTask }) {
  const narrativeBlocks = toNarrativeBlocks(task.whatWasDone)
  const artifactLinks = task.links.filter(
    (link) => !task.prUrl || link.url !== task.prUrl,
  )

  return (
    <article className="border border-border/70 bg-card px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
            Shipped · {task.taskId}
          </p>
          <h3 className="mt-1 font-[var(--font-newsreader)] text-2xl leading-tight text-foreground">
            {task.title}
          </h3>
        </div>
        {task.dateCompleted && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {task.dateCompleted}
          </p>
        )}
      </div>

      <p className="mt-4 font-mono text-sm leading-relaxed text-foreground/95">
        {task.oneLineSummary}
      </p>

      {narrativeBlocks.length > 0 && (
        <div className="mt-4 space-y-3 border-l border-border/70 pl-4">
          {narrativeBlocks.map((block, index) => (
            <p
              key={`${task.id}-narrative-${index}`}
              className="whitespace-pre-wrap font-[var(--font-newsreader)] text-[15px] leading-relaxed text-foreground/90"
            >
              {block}
            </p>
          ))}
        </div>
      )}

      <TaskVideo task={task} />

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {task.prUrl && (
          <a
            href={task.prUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-accent hover:underline"
          >
            PR Link
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {artifactLinks.map((link) => (
          <a
            key={`${task.id}-${link.url}-${link.label}`}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            {link.label}
            <ExternalLink className="h-3 w-3" />
          </a>
        ))}
      </div>
    </article>
  )
}

export function WeeklyReportClient({ report }: Props) {
  const progressFill = useMemo(
    () => Math.max(0, Math.min(100, report.progress.percentage)),
    [report.progress.percentage],
  )
  const executiveSummary = useMemo(
    () => buildExecutiveSummary(report),
    [report],
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="font-bebas text-2xl tracking-tight">Burley</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Weekly report
            </span>
          </div>
          <Link
            href="/client/dashboard"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        <section className="border border-border/70 bg-card px-4 py-6 sm:px-8 sm:py-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
            {report.clientName}
          </p>
          <h1 className="mt-2 font-bebas text-5xl leading-none tracking-tight sm:text-7xl">
            {report.projectName}
          </h1>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Weekly Narrative Recap
          </p>
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            {report.weekRangeLabel}
          </p>
        </section>

        <section className="border border-border/70 bg-card px-4 py-5 sm:px-6">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            High level takeaway
          </h2>
          <p className="mt-3 font-[var(--font-newsreader)] text-lg leading-relaxed text-foreground/90">
            {executiveSummary}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            What shipped this week
          </h2>
          {report.completed.length === 0 ? (
            <div className="border border-border/70 bg-card px-4 py-5 font-[var(--font-newsreader)] text-base leading-relaxed text-muted-foreground">
              No tasks crossed the done line this week. The team focused on work in
              progress and queue setup for upcoming delivery.
            </div>
          ) : (
            <div className="space-y-3">
              {report.completed.map((task) => (
                <ShippedNarrative key={task.id} task={task} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Progress
          </h2>
          <div className="border border-border/70 bg-card px-4 py-4 sm:px-6">
            <p className="font-mono text-sm text-foreground">
              {report.progress.done} task{report.progress.done === 1 ? "" : "s"} shipped this week.{" "}
              {report.progress.total - report.progress.done} remaining in the queue.
            </p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              {report.progress.percentage}% of active scope complete.
            </p>
            <div className="mt-4 h-2 w-full border border-border/70 bg-secondary">
              <div
                className="h-full bg-accent"
                style={{ width: `${progressFill}%` }}
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Blocked / Waiting
          </h2>
          {report.blocked.length === 0 ? (
            <div className="border border-border/70 bg-card px-4 py-4 font-mono text-xs text-muted-foreground">
              No blockers need client-side action this week.
            </div>
          ) : (
            <div className="space-y-2">
              {report.blocked.map((task) => (
                <div
                  key={task.id}
                  className="border border-red-500/50 bg-red-500/10 px-4 py-3"
                >
                  <p className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-red-300">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Needs attention
                  </p>
                  <p className="mt-2 font-mono text-xs text-foreground">
                    {task.taskId} · {task.title}
                  </p>
                  <p className="mt-1 font-[var(--font-newsreader)] text-[15px] leading-relaxed text-red-100">
                    {task.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Up next
          </h2>
          <div className="border border-border/70 bg-card px-4 py-4">
            <ol className="space-y-3">
              {report.upNext.length === 0 ? (
                <li className="font-mono text-xs text-muted-foreground">
                  No queued tasks right now.
                </li>
              ) : (
                report.upNext.map((task, index) => (
                  <li key={task.id} className="border-l border-border/70 pl-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {index + 1}. {task.taskId}
                    </p>
                    <p className="mt-1 font-[var(--font-newsreader)] text-lg leading-tight text-foreground">
                      {task.title}
                    </p>
                  </li>
                ))
              )}
            </ol>
          </div>
        </section>

        <section className="border border-border/70 bg-card px-4 py-4 sm:px-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Timeline note
          </p>
          <p className="mt-2 font-[var(--font-newsreader)] text-lg leading-relaxed text-foreground/90">
            {report.timelineNote}
          </p>
        </section>
      </main>
    </div>
  )
}
