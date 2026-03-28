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
  X,
  Copy,
  Check,
} from "lucide-react"

interface ArtifactWithContext {
  type: string
  url: string
  label?: string
  content?: string
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
    spec: { icon: FileText, color: "text-indigo-400" },
  }

function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://")
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

function ArtifactContentModal({
  artifact,
  onClose,
}: {
  artifact: ArtifactWithContext
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (artifact.content) {
      navigator.clipboard.writeText(artifact.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const iconCfg = ARTIFACT_ICONS[artifact.type] ?? {
    icon: File,
    color: "text-muted-foreground",
  }
  const Icon = iconCfg.icon

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border/60 rounded-sm w-full max-w-3xl mx-4 shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/40">
          <div className="flex items-center gap-3 min-w-0">
            <Icon className={`h-4 w-4 flex-shrink-0 ${iconCfg.color}`} />
            <div className="min-w-0">
              <p className="font-mono text-xs text-foreground truncate">
                {artifact.label || artifact.url}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {artifact.assignee ?? "unknown"} · {formatDate(artifact.addedAt)} · {artifact.taskTitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {artifact.content && (
              <button
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="Copy content"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            )}
            {isExternalUrl(artifact.url) && (
              <a
                href={artifact.url}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-1"
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {artifact.content ? (
            <pre className="font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
              {artifact.content}
            </pre>
          ) : isExternalUrl(artifact.url) ? (
            <div className="text-center py-10 space-y-3">
              <ExternalLink className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="font-mono text-xs text-muted-foreground">
                External link — opens in a new tab
              </p>
              <a
                href={artifact.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-mono text-xs rounded-sm hover:bg-primary/20 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Link
              </a>
            </div>
          ) : (
            <div className="text-center py-10 space-y-3">
              <File className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="font-mono text-xs text-muted-foreground">
                Local file reference — no content stored yet
              </p>
              <p className="font-mono text-[10px] text-muted-foreground/60">
                {artifact.url}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground/60">
                Agents can attach content by including a &quot;content&quot; field when adding artifacts.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border/40 font-mono text-[10px] text-muted-foreground">
          <span>Path: {artifact.url}</span>
          <span>{artifact.type}</span>
        </div>
      </div>
    </div>
  )
}

export function ArtifactsPanel() {
  const [artifacts, setArtifacts] = useState<ArtifactWithContext[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAgent, setFilterAgent] = useState("")
  const [filterType, setFilterType] = useState("")
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactWithContext | null>(null)

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

  function handleCardClick(artifact: ArtifactWithContext) {
    // External URLs with no stored content — open in new tab
    if (isExternalUrl(artifact.url) && !artifact.content) {
      window.open(artifact.url, "_blank")
      return
    }
    // Everything else — open modal (shows content if available, or "no content" message)
    setSelectedArtifact(artifact)
  }

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
            const hasContent = !!artifact.content
            const isExternal = isExternalUrl(artifact.url)

            return (
              <div
                key={`${artifact.taskDocId}-${artifact.url}-${i}`}
                onClick={() => handleCardClick(artifact)}
                className="border border-border/40 rounded-sm bg-background hover:border-border transition-all cursor-pointer group"
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
                    <div className="flex items-center gap-1.5">
                      {hasContent && (
                        <span className="font-mono text-[10px] text-emerald-400/70 bg-emerald-400/10 px-1.5 py-0.5 rounded-sm">
                          content
                        </span>
                      )}
                      {isExternal && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                  </div>

                  {/* Label */}
                  <p className="font-mono text-xs text-foreground leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
                    {artifact.label || artifact.url}
                  </p>

                  {/* Content preview */}
                  {hasContent && (
                    <p className="font-mono text-[10px] text-muted-foreground line-clamp-2 bg-muted/20 rounded-sm px-2 py-1.5">
                      {artifact.content!.slice(0, 120)}...
                    </p>
                  )}

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

      {/* Content modal */}
      {selectedArtifact && (
        <ArtifactContentModal
          artifact={selectedArtifact}
          onClose={() => setSelectedArtifact(null)}
        />
      )}
    </div>
  )
}
