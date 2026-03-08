"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Eye, Pencil } from "lucide-react"
import { MilestonesContent } from "@/components/milestones-content"
import type { MilestoneProject } from "@/lib/types/milestone"

interface Props {
  project: MilestoneProject
}

export function MilestonesAdminClient({ project }: Props) {
  const [viewMode, setViewMode] = useState<"admin" | "client">("admin")

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 sticky top-0 z-10 backdrop-blur-sm bg-background/80">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bebas text-2xl tracking-tight">Burley</span>
            <span className="font-mono text-xs text-muted-foreground border border-border/50 rounded-sm px-2 py-0.5 bg-primary/10 text-primary">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* View mode toggle */}
            <div className="flex items-center border border-border/50 rounded-sm overflow-hidden">
              <button
                onClick={() => setViewMode("admin")}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                  viewMode === "admin"
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Pencil className="h-3 w-3" />
                Admin
              </button>
              <button
                onClick={() => setViewMode("client")}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors border-l border-border/50 ${
                  viewMode === "client"
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="h-3 w-3" />
                Client View
              </button>
            </div>

            <a
              href="/client/dashboard"
              className="font-mono text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Client portal
            </a>
            <Link
              href="/admin"
              className="font-mono text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Admin
            </Link>
          </div>
        </div>
      </header>

      {viewMode === "client" && (
        <div className="bg-amber-400/10 border-b border-amber-400/20">
          <div className="max-w-5xl mx-auto px-6 py-2 flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 text-amber-400" />
            <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest">
              Previewing client view — this is what {project.clientName} sees
            </p>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-10">
        <MilestonesContent project={project} editable={viewMode === "admin"} />
      </main>
    </div>
  )
}
