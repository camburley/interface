"use client"

import { useState, useCallback } from "react"
import {
  ChevronDown,
  ChevronUp,
  Plus,
  GripVertical,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
  Bug,
  Wrench,
  Image as ImageIcon,
  Play,
  Link as LinkIcon,
  X,
  Check,
  Paperclip,
} from "lucide-react"
import { toast } from "sonner"
import type {
  Milestone,
  MilestoneProject,
  MilestoneStatus,
  StoryStatus,
  FundingSource,
  Story,
  StoryAttachment,
} from "@/lib/types/milestone"
import {
  getMilestoneProgress,
  getProjectProgress,
  getTotalFunded,
  getTotalSpent,
  isCountedMilestone,
} from "@/lib/types/milestone"

const MILESTONE_STATUS_CONFIG: Record<MilestoneStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "text-muted-foreground bg-muted/30 border-border" },
  active: { label: "Active", className: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  completed: { label: "Completed", className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  "on-hold": { label: "On Hold", className: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
}

const MILESTONE_STATUS_OPTIONS: MilestoneStatus[] = ["draft", "active", "completed", "on-hold"]

const STORY_STATUS_CONFIG: Record<StoryStatus, { label: string; className: string }> = {
  todo: { label: "Todo", className: "text-muted-foreground" },
  "in-progress": { label: "In Progress", className: "text-blue-400" },
  review: { label: "Review", className: "text-purple-400" },
  done: { label: "Done", className: "text-emerald-400" },
  blocked: { label: "Blocked", className: "text-red-400" },
}

const FUNDING_LABELS: Record<FundingSource, string> = {
  "upwork-escrow": "Upwork Escrow",
  retainer: "Retainer",
  invoice: "Invoice",
  prepaid: "Prepaid",
}

const STORY_STATUS_OPTIONS: StoryStatus[] = ["todo", "in-progress", "review", "done", "blocked"]

const ATTACHMENT_TYPE_OPTIONS: StoryAttachment["type"][] = ["screenshot", "loom", "url"]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`
}

const ATTACHMENT_ICONS: Record<StoryAttachment["type"], typeof ImageIcon> = {
  screenshot: ImageIcon,
  loom: Play,
  url: LinkIcon,
}

interface StoryEditState {
  title: string
  placeholder: boolean
  notes: string
  outputUrl: string
  specUrl: string
}

interface NewAttachmentState {
  type: StoryAttachment["type"]
  url: string
  label: string
}

interface MilestonesContentProps {
  project: MilestoneProject
  editable?: boolean
}

export function MilestonesContent({ project: initialProject, editable = false }: MilestonesContentProps) {
  const [project, setProject] = useState<MilestoneProject>(initialProject)
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(
    new Set(project.milestones.filter((m) => m.status === "active").map((m) => m.id)),
  )
  const [showAddMilestone, setShowAddMilestone] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<StoryEditState>({
    title: "",
    placeholder: false,
    notes: "",
    outputUrl: "",
    specUrl: "",
  })
  const [newAttachment, setNewAttachment] = useState<NewAttachmentState>({ type: "screenshot", url: "", label: "" })
  const [showAttachmentForm, setShowAttachmentForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    amount: "",
    fundingSource: "upwork-escrow" as FundingSource,
    deliverables: "",
  })

  const [newStoryTitle, setNewStoryTitle] = useState<Record<string, string>>({})

  const countedMilestones = project.milestones.filter(isCountedMilestone)
  const totalBudget = countedMilestones.reduce((s, m) => s + m.amount, 0)
  const funded = getTotalFunded(project)
  const spent = getTotalSpent(project)
  const projectProgress = getProjectProgress(project)
  const displayMilestones =
    project.milestones.length > 1
      ? [project.milestones[0], ...project.milestones.slice(1).reverse()]
      : project.milestones

  function toggleMilestone(id: string) {
    setExpandedMilestones((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function startEditingStory(story: Story) {
    setEditingStoryId(story.id)
    setEditForm({
      title: story.title,
      placeholder: story.placeholder ?? false,
      notes: story.notes ?? "",
      outputUrl: story.outputUrl ?? "",
      specUrl: story.specUrl ?? "",
    })
    setShowAttachmentForm(false)
    setNewAttachment({ type: "screenshot", url: "", label: "" })
    setOpenDropdown(null)
  }

  function cancelEditing() {
    setEditingStoryId(null)
    setShowAttachmentForm(false)
  }

  const saveStoryEdit = useCallback(async (milestoneId: string, storyId: string) => {
    setSaving(true)
    const updates: Record<string, string> = {}
    if (editForm.title) updates.title = editForm.title
    ;(updates as Record<string, string | boolean>).placeholder = editForm.placeholder
    updates.notes = editForm.notes
    updates.outputUrl = editForm.outputUrl
    updates.specUrl = editForm.specUrl

    await fetch(`/api/admin/milestones/${milestoneId}/stories/${storyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })

    setProject((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              stories: m.stories.map((s) =>
                s.id === storyId
                  ? {
                      ...s,
                      title: editForm.title || s.title,
                      placeholder: editForm.placeholder,
                      notes: editForm.notes || undefined,
                      outputUrl: editForm.outputUrl || undefined,
                      specUrl: editForm.specUrl || undefined,
                    }
                  : s,
              ),
            }
          : m,
      ),
    }))

    setSaving(false)
    setEditingStoryId(null)
  }, [editForm])

  const addAttachmentToStory = useCallback(async (milestoneId: string, storyId: string) => {
    if (!newAttachment.url.trim()) return

    const attachment: StoryAttachment = {
      type: newAttachment.type,
      url: newAttachment.url.trim(),
      label: newAttachment.label.trim() || undefined,
      addedAt: new Date().toISOString(),
    }

    await fetch(`/api/admin/milestones/${milestoneId}/stories/${storyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attachments: [attachment] }),
    })

    setProject((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              stories: m.stories.map((s) =>
                s.id === storyId
                  ? { ...s, attachments: [...(s.attachments ?? []), attachment] }
                  : s,
              ),
            }
          : m,
      ),
    }))

    setNewAttachment({ type: "screenshot", url: "", label: "" })
    setShowAttachmentForm(false)
  }, [newAttachment])

  const updateMilestoneStatus = useCallback(async (milestoneId: string, status: MilestoneStatus) => {
    setProject((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === milestoneId
          ? { ...m, status, ...(status === "completed" ? { completedAt: new Date().toISOString() } : { completedAt: undefined }) }
          : m,
      ),
    }))

    await fetch(`/api/admin/milestones/${milestoneId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
  }, [])

  const updateStoryStatus = useCallback(async (milestoneId: string, storyId: string, status: StoryStatus) => {
    const prevStatus = project.milestones
      .find((m) => m.id === milestoneId)
      ?.stories.find((s) => s.id === storyId)?.status

    setProject((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              stories: m.stories.map((s) =>
                s.id === storyId
                  ? { ...s, status, ...(status === "done" ? { completedAt: new Date().toISOString() } : { completedAt: undefined }) }
                  : s,
              ),
            }
          : m,
      ),
    }))

    const res = await fetch(`/api/admin/milestones/${milestoneId}/stories/${storyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    const data = await res.json().catch(() => ({})) as { ok?: boolean; taskUpdated?: boolean }
    if (res.ok && data.taskUpdated === false) {
      toast.warning("Story updated. No linked task on board — run backfill or add task.")
    }

    if (!res.ok) {
      setProject((prev) => ({
        ...prev,
        milestones: prev.milestones.map((m) =>
          m.id === milestoneId
            ? {
                ...m,
                stories: m.stories.map((s) =>
                  s.id === storyId && prevStatus !== undefined
                    ? { ...s, status: prevStatus, completedAt: status === "done" ? undefined : s.completedAt }
                    : s,
                ),
              }
            : m,
        ),
      }))
      const msg = (data as { error?: string }).error ?? `Save failed (${res.status})`
      toast.error(msg)
    }
  }, [project.milestones])

  const addStory = useCallback(async (milestoneId: string) => {
    const title = newStoryTitle[milestoneId]?.trim()
    if (!title) return

    setNewStoryTitle((prev) => ({ ...prev, [milestoneId]: "" }))

    const res = await fetch(`/api/admin/milestones/${milestoneId}/stories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })

    const { id } = await res.json()

    const story: Story = {
      id,
      title,
      status: "todo",
      createdAt: new Date().toISOString(),
    }

    setProject((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === milestoneId ? { ...m, stories: [...m.stories, story] } : m,
      ),
    }))
  }, [newStoryTitle])

  const deleteStory = useCallback(async (milestoneId: string, storyId: string) => {
    setProject((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === milestoneId
          ? { ...m, stories: m.stories.filter((s) => s.id !== storyId) }
          : m,
      ),
    }))
    setOpenDropdown(null)

    await fetch(`/api/admin/milestones/${milestoneId}/stories/${storyId}`, { method: "DELETE" })
  }, [])

  const addMilestone = useCallback(async () => {
    if (!newMilestone.title.trim()) return

    const body = {
      projectId: project.id,
      title: newMilestone.title.trim(),
      description: newMilestone.description.trim() || undefined,
      amount: Number(newMilestone.amount) || 0,
      fundingSource: newMilestone.fundingSource,
      deliverables: newMilestone.deliverables
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean),
      order: project.milestones.length,
    }

    const res = await fetch("/api/admin/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const { id } = await res.json()

    const milestone: Milestone = {
      id,
      projectId: project.id,
      title: body.title,
      description: body.description,
      status: "draft",
      amount: body.amount,
      fundingSource: body.fundingSource,
      fundingStatus: "pending",
      deliverables: body.deliverables,
      stories: [],
      createdAt: new Date().toISOString(),
      order: body.order,
    }

    setProject((prev) => ({
      ...prev,
      milestones: [...prev.milestones, milestone],
    }))
    setNewMilestone({ title: "", description: "", amount: "", fundingSource: "upwork-escrow", deliverables: "" })
    setShowAddMilestone(false)
  }, [newMilestone, project.id, project.milestones.length])

  const inputClassName = "w-full bg-muted/20 border border-border/50 rounded-sm px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"

  return (
    <div className="space-y-8">
      {/* Project header */}
      <div>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-1">
          {project.clientName} — Project Milestones
        </p>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">{project.projectName}</h1>
      </div>

      {/* Budget overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Budget", value: formatCurrency(totalBudget) },
          { label: "Funded", value: formatCurrency(funded), accent: funded > 0 },
          { label: "Completed", value: formatCurrency(spent), accent: spent > 0 },
          { label: "Milestones", value: `${countedMilestones.filter((m) => m.status === "completed").length} / ${countedMilestones.length}` },
        ].map((card) => (
          <div key={card.label} className="border border-border/50 rounded-sm p-5 space-y-1">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{card.label}</p>
            <p className={`font-mono text-2xl font-bold ${card.accent ? "text-emerald-400" : "text-foreground"}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="border border-border/50 rounded-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Project Progress</p>
          <p className="font-mono text-xs text-foreground">{projectProgress}%</p>
        </div>
        <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${projectProgress}%` }} />
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Milestones ({project.milestones.length})
          </p>
          {editable && (
            <button
              onClick={() => setShowAddMilestone(!showAddMilestone)}
              className="flex items-center gap-1.5 font-mono text-xs text-primary hover:text-foreground transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Milestone
            </button>
          )}
        </div>

        {/* Add milestone dialog */}
        {editable && showAddMilestone && (
          <div className="border border-primary/30 bg-primary/5 rounded-sm p-6 space-y-4">
            <p className="font-mono text-xs text-primary uppercase tracking-widest">New Milestone</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Title</label>
                <input
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone((p) => ({ ...p, title: e.target.value }))}
                  className="w-full bg-muted/20 border border-border/50 rounded-sm px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  placeholder="Milestone title"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Amount ($)</label>
                <input
                  type="number"
                  value={newMilestone.amount}
                  onChange={(e) => setNewMilestone((p) => ({ ...p, amount: e.target.value }))}
                  className="w-full bg-muted/20 border border-border/50 rounded-sm px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  placeholder="1500"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Description</label>
                <input
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone((p) => ({ ...p, description: e.target.value }))}
                  className="w-full bg-muted/20 border border-border/50 rounded-sm px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  placeholder="What this milestone covers"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Funding Source</label>
                <select
                  value={newMilestone.fundingSource}
                  onChange={(e) => setNewMilestone((p) => ({ ...p, fundingSource: e.target.value as FundingSource }))}
                  className="w-full bg-muted/20 border border-border/50 rounded-sm px-4 py-2.5 font-mono text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  {(Object.keys(FUNDING_LABELS) as FundingSource[]).map((fs) => (
                    <option key={fs} value={fs}>{FUNDING_LABELS[fs]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Deliverables (one per line)</label>
                <textarea
                  value={newMilestone.deliverables}
                  onChange={(e) => setNewMilestone((p) => ({ ...p, deliverables: e.target.value }))}
                  rows={3}
                  className="w-full bg-muted/20 border border-border/50 rounded-sm px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder={"First deliverable\nSecond deliverable"}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={addMilestone}
                className="flex items-center gap-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-5 py-2.5 rounded-sm hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Milestone
              </button>
              <button
                onClick={() => setShowAddMilestone(false)}
                className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Milestone list */}
        {displayMilestones.map((milestone) => {
          const expanded = expandedMilestones.has(milestone.id)
          const progress = getMilestoneProgress(milestone)
          const done = milestone.stories.filter((s) => s.status === "done").length
          const inProgress = milestone.stories.filter((s) => s.status === "in-progress" || s.status === "review").length
          const waiting = milestone.stories.filter((s) => s.status === "todo").length
          const blocked = milestone.stories.filter((s) => s.status === "blocked").length
          const placeholderCount = milestone.stories.filter((s) => s.placeholder).length
          const statusCfg = MILESTONE_STATUS_CONFIG[milestone.status]

          return (
            <div key={milestone.id} className="border border-border/40 rounded-sm">
              <button
                onClick={() => toggleMilestone(milestone.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/10 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs text-muted-foreground shrink-0">M{milestone.order + 1}</span>
                  {milestone.kind === "bug" && (
                    <Bug className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  )}
                  {milestone.kind === "feature" && (
                    <Wrench className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  )}
                  {editable ? (
                    <select
                      value={milestone.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation()
                        updateMilestoneStatus(milestone.id, e.target.value as MilestoneStatus)
                      }}
                      className={`inline-flex items-center px-2.5 py-1 border rounded-sm font-mono text-[10px] uppercase tracking-widest shrink-0 cursor-pointer bg-transparent focus:outline-none ${statusCfg.className}`}
                    >
                      {MILESTONE_STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{MILESTONE_STATUS_CONFIG[opt].label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-1 border rounded-sm font-mono text-[10px] uppercase tracking-widest shrink-0 ${statusCfg.className}`}>
                      {statusCfg.label}
                    </span>
                  )}
                  <span className="font-mono text-sm text-foreground truncate">{milestone.title}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest hidden md:block">
                    {FUNDING_LABELS[milestone.fundingSource]}
                  </span>
                  <span className={`font-mono text-[10px] uppercase tracking-widest ${milestone.fundingStatus === "funded" ? "text-emerald-400" : "text-muted-foreground"}`}>
                    {milestone.fundingStatus}
                  </span>
                  <span className="font-mono text-sm text-foreground">{formatCurrency(milestone.amount)}</span>
                  {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {expanded && (
                <div className="border-t border-border/30">
                  {/* Progress bar */}
                  <div className="px-5 pt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                        {done}/{milestone.stories.length} stories done
                      </p>
                      <p className="font-mono text-xs text-foreground">{progress}%</p>
                    </div>
                    <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {/* Description & deliverables */}
                  {(milestone.description || milestone.deliverables.length > 0) && (
                    <div className="px-5 pt-4 space-y-3">
                      {milestone.description && (
                        <p className="font-mono text-xs text-muted-foreground leading-relaxed">{milestone.description}</p>
                      )}
                      {milestone.deliverables.length > 0 && (
                        <div>
                          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Deliverables</p>
                          <ul className="space-y-1">
                            {milestone.deliverables.map((d, i) => (
                              <li key={i} className="font-mono text-xs text-foreground flex items-start gap-2">
                                <span className="text-muted-foreground shrink-0 mt-0.5">·</span>
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {milestone.completionCriteria && (
                        <p className="font-mono text-[10px] text-muted-foreground leading-relaxed border-t border-border/20 pt-3">
                          <span className="uppercase tracking-widest">Done when: </span>
                          {milestone.completionCriteria}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stories table */}
                  <div className="px-5 pt-5 pb-5">
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Stories / Items</p>
                    <div className="border border-border/30 rounded-sm divide-y divide-border/20">
                      {milestone.stories.map((story) => {
                        const storyCfg = STORY_STATUS_CONFIG[story.status]
                        const isEditing = editingStoryId === story.id

                        if (isEditing && editable) {
                          return (
                            <div key={story.id} className="px-3 py-3 space-y-3 bg-muted/5">
                              <div className="flex items-center justify-between">
                                <p className="font-mono text-[10px] text-primary uppercase tracking-widest">Edit Story</p>
                                <button onClick={cancelEditing} className="text-muted-foreground hover:text-foreground transition-colors">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Title</label>
                                  <input
                                    value={editForm.title}
                                    onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                                    className={inputClassName}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Placeholder</label>
                                  <label className="flex items-center gap-2 h-9 font-mono text-xs text-foreground">
                                    <input
                                      type="checkbox"
                                      checked={editForm.placeholder}
                                      onChange={(e) => setEditForm((p) => ({ ...p, placeholder: e.target.checked }))}
                                      className="h-4 w-4 rounded border-border/50 bg-muted/20"
                                    />
                                    Needs follow-up later
                                  </label>
                                </div>
                                <div className="space-y-1">
                                  <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Notes</label>
                                  <input
                                    value={editForm.notes}
                                    onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                                    placeholder="Notes..."
                                    className={inputClassName}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Output URL</label>
                                  <input
                                    value={editForm.outputUrl}
                                    onChange={(e) => setEditForm((p) => ({ ...p, outputUrl: e.target.value }))}
                                    placeholder="https://..."
                                    className={inputClassName}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Spec URL</label>
                                  <input
                                    value={editForm.specUrl}
                                    onChange={(e) => setEditForm((p) => ({ ...p, specUrl: e.target.value }))}
                                    placeholder="https://..."
                                    className={inputClassName}
                                  />
                                </div>
                              </div>

                              {/* Existing attachments */}
                              {story.attachments && story.attachments.length > 0 && (
                                <div className="space-y-1.5">
                                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Attachments</p>
                                  <div className="flex flex-wrap gap-2">
                                    {story.attachments.map((att, i) => {
                                      const Icon = ATTACHMENT_ICONS[att.type]
                                      return (
                                        <a
                                          key={i}
                                          href={att.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1.5 border border-border/50 rounded-sm px-2.5 py-1 font-mono text-[10px] text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                                        >
                                          <Icon className="h-3 w-3" />
                                          {att.label || att.type}
                                        </a>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Add attachment form */}
                              {showAttachmentForm ? (
                                <div className="border border-border/30 rounded-sm p-3 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">New Attachment</p>
                                    <button onClick={() => setShowAttachmentForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <select
                                      value={newAttachment.type}
                                      onChange={(e) => setNewAttachment((p) => ({ ...p, type: e.target.value as StoryAttachment["type"] }))}
                                      className={inputClassName}
                                    >
                                      {ATTACHMENT_TYPE_OPTIONS.map((t) => (
                                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                      ))}
                                    </select>
                                    <input
                                      value={newAttachment.url}
                                      onChange={(e) => setNewAttachment((p) => ({ ...p, url: e.target.value }))}
                                      placeholder="URL..."
                                      className={inputClassName}
                                    />
                                    <input
                                      value={newAttachment.label}
                                      onChange={(e) => setNewAttachment((p) => ({ ...p, label: e.target.value }))}
                                      placeholder="Label (optional)"
                                      className={inputClassName}
                                    />
                                  </div>
                                  <button
                                    onClick={() => addAttachmentToStory(milestone.id, story.id)}
                                    disabled={!newAttachment.url.trim()}
                                    className="flex items-center gap-1.5 font-mono text-[10px] text-primary hover:text-foreground uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    <Plus className="h-3 w-3" />
                                    Add Attachment
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setShowAttachmentForm(true)}
                                  className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  Add Attachment
                                </button>
                              )}

                              <div className="flex items-center gap-3 pt-1">
                                <button
                                  onClick={() => saveStoryEdit(milestone.id, story.id)}
                                  disabled={saving}
                                  className="flex items-center gap-1.5 bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-widest px-4 py-2 rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
                                >
                                  <Check className="h-3 w-3" />
                                  {saving ? "Saving..." : "Save"}
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )
                        }

                        return (
                          <div key={story.id} className="flex items-center gap-3 px-3 py-2.5 group hover:bg-muted/10 transition-colors">
                            {editable && (
                              <GripVertical className="h-3.5 w-3.5 text-border shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {story.kind === "bug" && (
                                  <Bug className="h-3.5 w-3.5 text-red-400 shrink-0" />
                                )}
                                <span className="font-mono text-xs text-foreground truncate">{story.title}</span>
                                {story.placeholder && (
                                  <span className="inline-flex items-center px-2 py-0.5 border border-amber-400/30 rounded-sm font-mono text-[10px] uppercase tracking-widest text-amber-400 bg-amber-400/10 shrink-0">
                                    Placeholder
                                  </span>
                                )}
                                {story.outputUrl && (
                                  <a href={story.outputUrl} target="_blank" rel="noreferrer" className="shrink-0">
                                    <ExternalLink className="h-3 w-3 text-primary hover:text-foreground transition-colors" />
                                  </a>
                                )}
                                {story.specUrl && (
                                  <a href={story.specUrl} target="_blank" rel="noreferrer" className="shrink-0 font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                                    spec
                                  </a>
                                )}
                                {story.attachments && story.attachments.length > 0 && (
                                  <span className="flex items-center gap-1 shrink-0">
                                    {story.attachments.map((att, i) => {
                                      const Icon = ATTACHMENT_ICONS[att.type]
                                      return (
                                        <a
                                          key={i}
                                          href={att.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          title={att.label || att.type}
                                          className="text-primary/70 hover:text-primary transition-colors"
                                        >
                                          <Icon className="h-3 w-3" />
                                        </a>
                                      )
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Notes */}
                            {story.notes && (
                              <span className="hidden md:block font-mono text-[10px] text-muted-foreground truncate max-w-[200px]">
                                {story.notes}
                              </span>
                            )}

                            {/* Status */}
                            {editable ? (
                              <select
                                value={story.status}
                                onChange={(e) => updateStoryStatus(milestone.id, story.id, e.target.value as StoryStatus)}
                                className={`bg-transparent border-none font-mono text-[10px] uppercase tracking-widest cursor-pointer focus:outline-none ${storyCfg.className}`}
                              >
                                {STORY_STATUS_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>{STORY_STATUS_CONFIG[opt].label}</option>
                                ))}
                              </select>
                            ) : (
                              <span className={`font-mono text-[10px] uppercase tracking-widest ${storyCfg.className}`}>
                                {storyCfg.label}
                              </span>
                            )}

                            {/* Actions dropdown (admin only) */}
                            {editable && (
                              <div className="relative shrink-0">
                                <button
                                  onClick={() => setOpenDropdown(openDropdown === story.id ? null : story.id)}
                                  className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </button>
                                {openDropdown === story.id && (
                                  <div className="absolute right-0 top-7 z-20 border border-border bg-background rounded-sm shadow-lg min-w-[140px]">
                                    <button
                                      onClick={() => startEditingStory(story)}
                                      className="w-full flex items-center gap-2 px-3 py-2 font-mono text-xs text-foreground hover:bg-muted/20 transition-colors"
                                    >
                                      <Pencil className="h-3 w-3" /> Edit
                                    </button>
                                    <button
                                      onClick={() => deleteStory(milestone.id, story.id)}
                                      className="w-full flex items-center gap-2 px-3 py-2 font-mono text-xs text-red-400 hover:bg-red-400/10 transition-colors"
                                    >
                                      <Trash2 className="h-3 w-3" /> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}

                      {/* Add story row (admin only) */}
                      {editable && (
                        <div className="flex items-center gap-3 px-3 py-2">
                          <Plus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <input
                            value={newStoryTitle[milestone.id] ?? ""}
                            onChange={(e) => setNewStoryTitle((p) => ({ ...p, [milestone.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addStory(milestone.id)
                            }}
                            placeholder="Add story..."
                            className="flex-1 bg-transparent font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                          />
                          <button
                            onClick={() => addStory(milestone.id)}
                            className="font-mono text-[10px] text-primary hover:text-foreground uppercase tracking-widest transition-colors shrink-0"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Summary footer */}
                    <div className="flex flex-wrap gap-4 mt-3 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                      <span className="text-emerald-400">{done} done</span>
                      <span className="text-blue-400">{inProgress} in progress</span>
                      <span>{waiting} waiting</span>
                      {placeholderCount > 0 && <span className="text-amber-400">{placeholderCount} placeholder</span>}
                      {blocked > 0 && <span className="text-red-400">{blocked} blocked</span>}
                      {milestone.dueDate && (
                        <span className="ml-auto">Due {formatDate(milestone.dueDate)}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
