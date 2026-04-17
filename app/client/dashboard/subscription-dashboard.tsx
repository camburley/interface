"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  LogOut,
  LayoutGrid,
  ListChecks,
  CheckCircle,
  Clock,
  Zap,
  Calendar,
  Mail,
  User,
  CreditCard,
  Settings,
} from "lucide-react"

interface SubscriptionData {
  id: string
  status: string
  tierKey: string
  tierLabel: string
  amountCents: number
  interval: string
  currentPeriodStart: number
  currentPeriodEnd: number
  cancelAtPeriodEnd: boolean
  created: number
}

interface TaskCounts {
  todo: number
  in_progress: number
  review: number
  done: number
}

interface Props {
  clientName: string
  clientEmail: string
  projectName: string
  milestoneProjectId?: string
  initialTaskCounts?: TaskCounts
  boardHref?: string
  subscriptionData?: SubscriptionData
}

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatCurrency(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

const STATUS_DISPLAY: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  past_due: { label: "Past Due", className: "text-red-400 bg-red-400/10 border-red-400/20" },
  canceled: { label: "Canceled", className: "text-muted-foreground bg-muted/30 border-border" },
  paused: { label: "Paused", className: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  trialing: { label: "Trial", className: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
}

function DashboardInner({ clientName, clientEmail, projectName, milestoneProjectId, initialTaskCounts, boardHref, subscriptionData }: Props) {
  const router = useRouter()
  const [sub, setSub] = useState<SubscriptionData | null>(subscriptionData ?? null)
  const [loadingSub, setLoadingSub] = useState(!subscriptionData)
  const [taskCounts, setTaskCounts] = useState<TaskCounts>(initialTaskCounts ?? { todo: 0, in_progress: 0, review: 0, done: 0 })
  const [loadingTasks, setLoadingTasks] = useState(!initialTaskCounts)

  const resolvedBoardHref = boardHref ?? "/client/board"

  useEffect(() => {
    if (subscriptionData) return
    fetch("/api/client/subscription")
      .then((r) => r.json())
      .then((data) => {
        if (data.subscription) setSub(data.subscription)
      })
      .catch(() => {})
      .finally(() => setLoadingSub(false))
  }, [subscriptionData])

  useEffect(() => {
    if (initialTaskCounts) return
    fetch("/api/client/tasks")
      .then((r) => r.json())
      .then((data) => {
        if (data.tasks) {
          const counts: TaskCounts = { todo: 0, in_progress: 0, review: 0, done: 0 }
          for (const t of data.tasks) {
            if (t.status in counts) counts[t.status as keyof TaskCounts]++
          }
          setTaskCounts(counts)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTasks(false))
  }, [initialTaskCounts])

  async function handleLogout() {
    await fetch("/api/client/logout", { method: "POST" })
    router.push("/client/login")
    router.refresh()
  }

  const statusCfg = sub ? (STATUS_DISPLAY[sub.status] ?? STATUS_DISPLAY.active) : null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 sticky top-0 z-10 backdrop-blur-sm bg-background/80">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bebas text-2xl text-foreground tracking-tight">Burley</span>
            <span className="font-mono text-xs text-muted-foreground border border-border/50 rounded-sm px-2 py-0.5">
              Client Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-muted-foreground hidden sm:block">
              {clientEmail}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {/* Account info */}
        <div className="border border-border/40 rounded-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                  Account
                </p>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  {clientName}
                </h1>
              </div>
              <div className="flex items-center gap-6 font-mono text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {clientEmail}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {projectName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription card */}
        <div className="border border-border/40 rounded-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Subscription
            </p>
            {sub && statusCfg && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border font-mono text-xs ${statusCfg.className}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {statusCfg.label}
              </span>
            )}
          </div>

          {loadingSub ? (
            <div className="py-4">
              <p className="font-mono text-xs text-muted-foreground">Loading subscription...</p>
            </div>
          ) : sub ? (
            <div className="space-y-5">
              {/* Tier + price */}
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs uppercase tracking-widest px-3 py-1.5 rounded-sm bg-primary/10 text-primary border border-primary/30 font-medium">
                  {sub.tierLabel}
                </span>
                <span className="text-3xl font-bold text-foreground tracking-tight">
                  {formatCurrency(sub.amountCents)}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  /{sub.interval}
                </span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Member since
                  </p>
                  <p className="font-mono text-sm text-foreground">
                    {formatDate(sub.created)}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Next renewal
                  </p>
                  <p className="font-mono text-sm text-foreground">
                    {sub.cancelAtPeriodEnd ? "Cancels" : formatDate(sub.currentPeriodEnd)}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    Current period
                  </p>
                  <p className="font-mono text-sm text-foreground">
                    {formatDate(sub.currentPeriodStart)} — {formatDate(sub.currentPeriodEnd)}
                  </p>
                </div>
              </div>

              {sub.cancelAtPeriodEnd && (
                <div className="border border-amber-400/30 bg-amber-400/5 rounded-sm px-4 py-3">
                  <p className="font-mono text-xs text-amber-400">
                    Your subscription will end on {formatDate(sub.currentPeriodEnd)}. Contact Cam to reactivate.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="font-mono text-xs text-muted-foreground py-4">
              No active subscription found.
            </p>
          )}
        </div>

        {/* Board snapshot */}
        <div className="border border-border/40 rounded-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Board
            </p>
            <Link
              href={resolvedBoardHref}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-sm hover:bg-primary/90 transition-colors"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Open Board
            </Link>
          </div>

          {loadingTasks ? (
            <p className="font-mono text-xs text-muted-foreground">Loading...</p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              <div className="border border-blue-400/20 bg-blue-400/5 rounded-sm p-3 text-center">
                <p className="text-2xl font-bold text-blue-400">{taskCounts.todo}</p>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                  To Do
                </p>
              </div>
              <div className="border border-amber-400/20 bg-amber-400/5 rounded-sm p-3 text-center">
                <p className="text-2xl font-bold text-amber-400">{taskCounts.in_progress}</p>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                  In Progress
                </p>
              </div>
              <div className="border border-purple-400/20 bg-purple-400/5 rounded-sm p-3 text-center">
                <p className="text-2xl font-bold text-purple-400">{taskCounts.review}</p>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                  Review
                </p>
              </div>
              <div className="border border-emerald-400/20 bg-emerald-400/5 rounded-sm p-3 text-center">
                <p className="text-2xl font-bold text-emerald-400">{taskCounts.done}</p>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                  Done
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="flex items-center gap-4 flex-wrap">
          {milestoneProjectId && (
            <Link
              href="/client/milestones"
              className="flex items-center gap-1.5 font-mono text-xs text-primary hover:text-foreground transition-colors"
            >
              <ListChecks className="h-3.5 w-3.5" />
              View milestones
            </Link>
          )}
          <Link
            href="/client/reports/weekly"
            className="flex items-center gap-1.5 font-mono text-xs text-primary hover:text-foreground transition-colors"
          >
            <Calendar className="h-3.5 w-3.5" />
            Weekly report
          </Link>
          <Link
            href="/client/settings"
            className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            Email preferences
          </Link>
        </div>

        {/* Footer note */}
        <div className="pt-4 border-t border-border/20">
          <p className="font-mono text-[10px] text-muted-foreground text-center">
            Async by default. Add tasks to your board anytime. Work moves through the queue.
          </p>
        </div>
      </main>
    </div>
  )
}

export function SubscriptionDashboardClient(props: Props) {
  return (
    <Suspense fallback={null}>
      <DashboardInner {...props} />
    </Suspense>
  )
}
