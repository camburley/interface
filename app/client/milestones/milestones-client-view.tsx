"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, LogOut } from "lucide-react"
import { MilestonesContent } from "@/components/milestones-content"
import type { MilestoneProject } from "@/lib/types/milestone"

interface Props {
  userEmail?: string
  project: MilestoneProject
}

export function MilestonesClientView({ userEmail, project }: Props) {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/client/logout", { method: "POST" })
    router.push("/client/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 sticky top-0 z-10 backdrop-blur-sm bg-background/80">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bebas text-2xl text-foreground tracking-tight">Burley</span>
            <span className="font-mono text-xs text-muted-foreground border border-border/50 rounded-sm px-2 py-0.5">
              Client Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="font-mono text-xs text-muted-foreground hidden sm:block">{userEmail}</span>
            )}
            <a
              href="/client/dashboard"
              className="font-mono text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </a>
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

      <main className="max-w-5xl mx-auto px-6 py-10">
        <MilestonesContent project={project} />
      </main>
    </div>
  )
}
