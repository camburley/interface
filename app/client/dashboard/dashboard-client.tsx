"use client"

import { Suspense, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import type { ClientData, RetainerItem, RetainerPayment } from "./page"
import Link from "next/link"
import {
  CheckCircle,
  Clock,
  Wrench,
  CircleDot,
  LogOut,
  ChevronDown,
  ChevronUp,
  CreditCard,
  RefreshCw,
  ListChecks,
} from "lucide-react"

const STATUS_CONFIG: Record<
  RetainerItem["status"],
  { label: string; icon: React.ReactNode; className: string }
> = {
  pending_approval: {
    label: "Awaiting Your Approval",
    icon: <CircleDot className="h-3.5 w-3.5" />,
    className: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  },
  approved: {
    label: "Approved",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  },
  in_progress: {
    label: "In Progress",
    icon: <Wrench className="h-3.5 w-3.5" />,
    className: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    className: "text-muted-foreground bg-muted/30 border-border",
  },
}

function StatusBadge({ status }: { status: RetainerItem["status"] }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border font-mono text-xs ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

interface Props {
  client: ClientData
  items: RetainerItem[]
  payments: RetainerPayment[]
}

function DashboardInner({ client, items, payments }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justFunded = searchParams.get("funded") === "true"

  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [checkingOut, startCheckout] = useTransition()

  if (justFunded) {
    toast.success("Retainer funded! Balance has been updated.")
  }

  async function handleApprove(itemId: string) {
    setApprovingId(itemId)
    try {
      const res = await fetch("/api/client/approve-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      })
      if (!res.ok) throw new Error()
      toast.success("Item approved. Work will begin shortly.")
      router.refresh()
    } catch {
      toast.error("Failed to approve item. Please try again.")
    } finally {
      setApprovingId(null)
    }
  }

  function handleTopUp() {
    startCheckout(async () => {
      const res = await fetch("/api/client/checkout", { method: "POST" })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error("Failed to start checkout. Please try again.")
    })
  }

  async function handleLogout() {
    await fetch("/api/client/logout", { method: "POST" })
    router.push("/client/login")
    router.refresh()
  }

  const totalBudgeted = items.reduce((sum, i) => sum + i.estimatedCost, 0)
  const totalSpent = items
    .filter((i) => i.status === "completed")
    .reduce((sum, i) => sum + (i.actualCost ?? i.estimatedCost), 0)
  const pending = items.filter((i) => i.status === "pending_approval")
  const active = items.filter((i) => i.status === "approved" || i.status === "in_progress")
  const completed = items.filter((i) => i.status === "completed")

  const balancePct = Math.min(100, Math.round((client.balance / 1000) * 100))

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40 sticky top-0 z-10 backdrop-blur-sm bg-background/80">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bebas text-2xl text-foreground tracking-tight">Burley</span>
            <span className="font-mono text-xs text-muted-foreground border border-border/50 rounded-sm px-2 py-0.5">
              Client Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-muted-foreground hidden sm:block">{client.email}</span>
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

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Project header */}
        <div>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-1">Active Project</p>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{client.projectName}</h1>
          <Link
            href="/client/milestones"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:text-foreground transition-colors mt-2"
          >
            <ListChecks className="h-3.5 w-3.5" />
            View project milestones
          </Link>
        </div>

        {/* Balance card */}
        <div className="border border-border/50 rounded-sm p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-1">Retainer Balance</p>
              <p className="text-4xl font-bold text-foreground tracking-tight">{formatCurrency(client.balance)}</p>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                {formatCurrency(totalSpent)} spent · {formatCurrency(totalBudgeted)} estimated across {items.length} item{items.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={handleTopUp}
              disabled={checkingOut}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
            >
              {checkingOut ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CreditCard className="h-3.5 w-3.5" />
              )}
              Top Up $1,000
            </button>
          </div>

          {/* Balance bar */}
          <div className="space-y-1.5">
            <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${balancePct}%` }}
              />
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {balancePct}% of $1,000 remaining
            </p>
          </div>
        </div>

        {/* Pending approval — highlighted */}
        {pending.length > 0 && (
          <div className="space-y-3">
            <p className="font-mono text-xs text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <CircleDot className="h-3.5 w-3.5" />
              Awaiting Your Approval ({pending.length})
            </p>
            <div className="space-y-2">
              {pending.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  expanded={expandedItem === item.id}
                  onToggle={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  onApprove={() => handleApprove(item.id)}
                  approving={approvingId === item.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Active items */}
        {active.length > 0 && (
          <div className="space-y-3">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Wrench className="h-3.5 w-3.5" />
              In Progress ({active.length})
            </p>
            <div className="space-y-2">
              {active.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  expanded={expandedItem === item.id}
                  onToggle={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed items */}
        {completed.length > 0 && (
          <div className="space-y-3">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5" />
              Completed ({completed.length})
            </p>
            <div className="space-y-2">
              {completed.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  expanded={expandedItem === item.id}
                  onToggle={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {items.length === 0 && (
          <div className="border border-dashed border-border/40 rounded-sm p-12 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-mono text-sm text-muted-foreground">No items yet. Cam will add scope items here as they come in.</p>
          </div>
        )}

        {/* Payment history */}
        {payments.length > 0 && (
          <div className="space-y-3">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Payment History</p>
            <div className="border border-border/30 rounded-sm divide-y divide-border/30">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-mono text-sm text-foreground">Retainer Top-Up</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-xs text-muted-foreground">{formatDate(p.createdAt)}</span>
                    <span className="font-mono text-sm text-emerald-400">+{formatCurrency(p.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export function DashboardClient(props: Props) {
  return (
    <Suspense fallback={null}>
      <DashboardInner {...props} />
    </Suspense>
  )
}

function ItemCard({
  item,
  expanded,
  onToggle,
  onApprove,
  approving,
}: {
  item: RetainerItem
  expanded: boolean
  onToggle: () => void
  onApprove?: () => void
  approving?: boolean
}) {
  const cfg = STATUS_CONFIG[item.status]
  const isPending = item.status === "pending_approval"

  return (
    <div
      className={`border rounded-sm transition-colors ${
        isPending ? "border-amber-400/30 bg-amber-400/5" : "border-border/40 bg-muted/10"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <StatusBadge status={item.status} />
          <span className="font-mono text-sm text-foreground truncate">{item.title}</span>
        </div>
        <div className="flex items-center gap-4 shrink-0 ml-4">
          <span className="font-mono text-sm text-foreground">${item.estimatedCost}</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border/30 pt-4">
          {item.description && (
            <p className="font-mono text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-xs text-muted-foreground">
            <div>
              <p className="uppercase tracking-widest mb-1">Added</p>
              <p className="text-foreground">{formatDate(item.createdAt)}</p>
            </div>
            {item.approvedAt && (
              <div>
                <p className="uppercase tracking-widest mb-1">Approved</p>
                <p className="text-foreground">{formatDate(item.approvedAt)}</p>
              </div>
            )}
            {item.completedAt && (
              <div>
                <p className="uppercase tracking-widest mb-1">Completed</p>
                <p className="text-foreground">{formatDate(item.completedAt)}</p>
              </div>
            )}
            {item.actualCost != null && (
              <div>
                <p className="uppercase tracking-widest mb-1">Actual Cost</p>
                <p className="text-foreground">${item.actualCost}</p>
              </div>
            )}
          </div>

          {isPending && onApprove && (
            <div className="pt-2">
              <p className="font-mono text-xs text-muted-foreground mb-3">
                By approving, you confirm the scope and estimated cost of {" "}
                <span className="text-foreground">${item.estimatedCost}</span>. Work begins immediately after approval.
              </p>
              <button
                onClick={onApprove}
                disabled={approving}
                className="flex items-center gap-2 bg-amber-400 text-black font-mono text-xs uppercase tracking-widest px-5 py-2.5 rounded-sm hover:bg-amber-300 transition-colors disabled:opacity-50"
              >
                {approving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                {approving ? "Approving..." : "Approve & Start Work"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
