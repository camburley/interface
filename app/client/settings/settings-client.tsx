"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  LogOut,
  ArrowLeft,
  Bell,
  CheckCircle,
  PlayCircle,
  Eye,
  BarChart3,
  Save,
  Github,
} from "lucide-react"

interface EmailPreferences {
  taskDone: boolean
  taskInProgress: boolean
  taskReview: boolean
  weeklySummary: boolean
}

interface GithubState {
  repo: string | null
  connected: boolean
}

interface Props {
  clientName: string
  clientEmail: string
  initialPrefs: EmailPreferences
  initialGithub: GithubState
}

const PREF_ITEMS: {
  key: keyof EmailPreferences
  label: string
  description: string
  icon: typeof Bell
  defaultOn: boolean
}[] = [
  {
    key: "taskDone",
    label: "Task completed",
    description:
      "Get notified when a task is marked as done. Includes a link to review the deliverable and see what's next in your queue.",
    icon: CheckCircle,
    defaultOn: true,
  },
  {
    key: "taskReview",
    label: "Ready for review",
    description:
      "Get notified when a task moves to review. You can leave feedback or approve it directly from the board.",
    icon: Eye,
    defaultOn: true,
  },
  {
    key: "taskInProgress",
    label: "Work started",
    description:
      "Get notified when work begins on a task. Useful for tracking when your items enter active development.",
    icon: PlayCircle,
    defaultOn: false,
  },
  {
    key: "weeklySummary",
    label: "Weekly summary",
    description:
      "A weekly recap of tasks completed, in progress, and upcoming in your queue.",
    icon: BarChart3,
    defaultOn: false,
  },
]

export function SettingsClient({ clientName, clientEmail, initialPrefs, initialGithub }: Props) {
  const router = useRouter()
  const [prefs, setPrefs] = useState<EmailPreferences>(initialPrefs)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const github = initialGithub

  async function handleLogout() {
    await fetch("/api/client/logout", { method: "POST" })
    router.push("/client/login")
    router.refresh()
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await fetch("/api/client/email-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: prefs }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      console.error("Failed to save preferences")
    } finally {
      setSaving(false)
    }
  }

  function toggle(key: keyof EmailPreferences) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }


  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 sticky top-0 z-10 backdrop-blur-sm bg-background/80">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bebas text-2xl text-foreground tracking-tight">
              Burley
            </span>
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

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center gap-3">
          <Link
            href="/client/dashboard"
            className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Settings
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            Manage your email notification preferences
          </p>
        </div>

        <div className="border border-border/40 rounded-sm divide-y divide-border/40">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-4 w-4 text-accent" />
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                Email Notifications
              </p>
            </div>
            <p className="font-mono text-xs text-muted-foreground mt-1">
              Choose which updates you want to receive by email. All
              notifications also appear on your board.
            </p>
          </div>

          {PREF_ITEMS.map((item) => {
            const Icon = item.icon
            const enabled = prefs[item.key]
            return (
              <div key={item.key} className="p-6 flex items-start gap-4">
                <div className="mt-0.5">
                  <Icon
                    className={`h-4 w-4 ${enabled ? "text-accent" : "text-muted-foreground/40"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-foreground font-medium">
                      {item.label}
                    </p>
                    {item.defaultOn && (
                      <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                        default
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-muted-foreground mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <button
                  onClick={() => toggle(item.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                    enabled
                      ? "bg-accent"
                      : "bg-secondary border border-border/60"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-foreground transition-transform ${
                      enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-accent text-background font-mono text-xs uppercase tracking-widest px-5 py-2.5 hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save preferences"}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 font-mono text-xs text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
        </div>

        {/* Connected repository (read-only, managed by admin) */}
        <div className="border border-border/40 rounded-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Github className="h-4 w-4 text-foreground" />
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                Connected Repository
              </p>
            </div>
            <p className="font-mono text-xs text-muted-foreground mt-1">
              Your repository is used by the feature scoping tool to reference
              your codebase when breaking down tasks.
            </p>
          </div>

          <div className="border-t border-border/40 p-6">
            {github.connected ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                  <Github className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-mono text-sm text-foreground font-medium">
                    {github.repo}
                  </p>
                  <p className="font-mono text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </p>
                </div>
              </div>
            ) : (
              <p className="font-mono text-xs text-muted-foreground/60">
                No repository connected yet. Your developer will set this up.
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-border/30 pt-6">
          <p className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
            Signed in as {clientName} · {clientEmail}
          </p>
        </div>
      </main>
    </div>
  )
}
