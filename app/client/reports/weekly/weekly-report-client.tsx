"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
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

function TaskVideo({ task }: { task: WeeklyCompletedTask }) {
  if (!task.video) return null

  const isDirectVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(task.video.url)

  if (task.video.embedUrl) {
    return (
      <div className="mt-3 border border-border/60 bg-card">
        <div className="aspect-video">
          <iframe
            src={task.video.embedUrl}
            title={`${task.title} demo`}
            className="h-full w-full"
            allowFullScreen
          />
        </div>
        <div className="border-t border-border/60 px-3 py-2">
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
      <div className="mt-3 border border-border/60 bg-card p-2">
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
      className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-accent hover:underline"
    >
      <PlayCircle className="h-3.5 w-3.5" />
      {task.video.label}
    </a>
  )
}

function CompletedCard({ task }: { task: WeeklyCompletedTask }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="border border-border/70 bg-card">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left hover:bg-secondary/30"
      >
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
            {task.taskId}
          </p>
          <h3 className="mt-1 font-mono text-sm text-foreground">{task.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground">
            {task.dateCompleted && <span>{task.dateCompleted}</span>}
            {task.prUrl && (
              <>
                <span>·</span>
                <a
                  href={task.prUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  PR
                  <ExternalLink className="h-3 w-3" />
                </a>
              </>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border/60 px-4 py-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            What was done
          </p>
          <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/90">
            {task.whatWasDone}
          </pre>
          <TaskVideo task={task} />
        </div>
      )}
    </article>
  )
}

export function WeeklyReportClient({ report }: Props) {
  const progressFill = useMemo(
    () => Math.max(0, Math.min(100, report.progress.percentage)),
    [report.progress.percentage],
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

      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6">
        <section className="border border-border/70 bg-card px-4 py-5 sm:px-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
            {report.clientName}
          </p>
          <h1 className="mt-2 font-bebas text-4xl tracking-tight sm:text-5xl">
            {report.projectName}
          </h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {report.weekRangeLabel}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Completed this week
          </h2>
          {report.completed.length === 0 ? (
            <div className="border border-border/70 bg-card px-4 py-4 font-mono text-xs text-muted-foreground">
              No completed tasks this week.
            </div>
          ) : (
            <div className="space-y-3">
              {report.completed.map((task) => (
                <CompletedCard key={task.id} task={task} />
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
              {report.progress.done} / {report.progress.total} done
            </p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              {report.progress.percentage}% complete
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
              No blocked tasks.
            </div>
          ) : (
            <div className="space-y-2">
              {report.blocked.map((task) => (
                <div
                  key={task.id}
                  className="border border-border/70 bg-card px-4 py-3"
                >
                  <p className="font-mono text-xs text-foreground">
                    {task.taskId} · {task.title}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
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
            <ol className="space-y-2">
              {report.upNext.length === 0 ? (
                <li className="font-mono text-xs text-muted-foreground">
                  No queued tasks right now.
                </li>
              ) : (
                report.upNext.map((task, index) => (
                  <li key={task.id} className="font-mono text-xs text-foreground">
                    {index + 1}. {task.taskId} · {task.title}
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
          <p className="mt-2 font-mono text-xs text-foreground/90">
            {report.timelineNote}
          </p>
        </section>
      </main>
    </div>
  )
}
