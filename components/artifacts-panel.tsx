"use client"

import { useState, useEffect } from "react"
import {
  MessageSquare,
  Link2,
  FileText,
  GitPullRequest,
  ExternalLink,
  Filter,
  Loader2,
  Image,
  Video,
  File,
  TestTube,
} from "lucide-react"

interface ArtifactWithContext {
  type: string
  url: string
  label?: string
  addedAt: string
  addedBy?: string
  taskDocId: string
  taskId: string
  taskTitle: string
  assignee?: string
  projectId: string
  taskStatus: string
}

const ARTIFACT_ICONS: Record<string, { icon: typeof FileText; color: string }> =
  {
    slack_thread: { icon: MessageSquare, color: "text-purple-400" },
    url: { icon: Link2, color: "text-blue-400" },
    file: { icon: File, color: "text-emerald-400" },
    github_pr: { icon: GitPullRequest, color: "text-orange-400" },
    document: { icon: FileText, color: "text-cyan-400" },
    figma: { icon: Image, color: "text-pink-400" },
    loom: { icon: Video, color: "text-violet-400" },
    screenshot: { icon: Image, color: "text-amber-400" },
    test_report: { icon: TestTube, color: "text-teal-400" },
  }

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  })
}

export function ArtifactsPanel() {
  const [artifacts, setArtifacts] = useState<ArtifactWithContext[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAgent, setFilterAgent] = useState("")
  const [filterType, setFilterType] = useState("")

  useEffect(() => {
    fetchArtifacts()
  }, [])

  async function fetchArtifacts() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/artifacts", {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        setArtifacts(data.artifacts ?? [])
      }
    } catch (err) {
      console.error("Failed to fetch artifacts:", err)
    } finally {
      setLoading(false)
    }
  }

  const agents = [...new Set(artifacts.map((a) => a.assignee).filter(Boolean))]
  const types = [...new Set(artifacts.map((a) => a.type))]

  const filtered = artifacts.filter((a) => {
    if (filterAgent && a.assignee !== filterAgent) return false
    if (filterType && a.type !== filterType) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 font-mono text-xs text-muted-foreground">
          Loading artifacts...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-3 font-mono text-xs">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <select
          value={filterAgent}
          onChange={(e) => setFilterAgent(e.target.value)}
          className="bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
        >
          <option value="">All Agents</option>
          {agents.map((a) => (
            <option key={a} value={a!}>
              {a}
            </option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
        >
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span className="text-muted-foreground ml-auto">
          {filtered.length} artifact{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Artifact cards */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-border/30 rounded-sm p-10 text-center">
          <p className="font-mono text-xs text-muted-foreground">
            No artifacts found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((artifact, i) => {
            const iconCfg = ARTIFACT_ICONS[artifact.type] ?? {
              icon: File,
              color: "text-muted-foreground",
            }
            const Icon = iconCfg.icon

            return (
              <div
                key={`${artifact.taskDocId}-${artifact.url}-${i}`}
                className="border border-border/40 rounded-sm bg-background hover:border-border transition-all"
              >
                <div className="p-4 space-y-3">
                  {/* Type badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${iconCfg.color}`} />
                      <span
                        className={`font-mono text-[10px] uppercase tracking-widest ${iconCfg.color}`}
                      >
                        {artifact.type.replace("_", " ")}
                      </span>
                    </div>
                    <a
                      href={artifact.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  {/* Label */}
                  <p className="font-mono text-xs text-foreground leading-relaxed line-clamp-2">
                    {artifact.label || artifact.url}
                  </p>

                  {/* Metadata */}
                  <div className="space-y-1 pt-2 border-t border-border/20">
                    <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                      <span>Agent: {artifact.assignee ?? "\u2014"}</span>
                      <span>{formatDate(artifact.addedAt)}</span>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground truncate">
                      Task: {artifact.taskTitle}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
