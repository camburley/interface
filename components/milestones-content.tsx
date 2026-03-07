"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Plus,
  GripVertical,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"
import type {
  Milestone,
  MilestoneProject,
  MilestoneStatus,
  StoryStatus,
  FundingSource,
  Story,
} from "@/lib/types/milestone"
import { getMilestoneProgress, getProjectProgress, getTotalFunded, getTotalSpent } from "@/lib/types/milestone"

// ---------------------------------------------------------------------------
// Demo data: Jan Savolainen — Doleright Mobile App
// ---------------------------------------------------------------------------

const DEMO_PROJECT: MilestoneProject = {
  id: "doleright-mobile-app",
  clientName: "Jan Savolainen",
  projectName: "Doleright Mobile App",
  milestones: [
    {
      id: "m0-presprint",
      projectId: "doleright-mobile-app",
      title: "Pre-Sprint Planning & Assets",
      description: "All planning, content, branding, and asset collection before sprint begins Mar 9.",
      status: "active",
      amount: 0,
      fundingSource: "upwork-escrow",
      fundingStatus: "funded",
      deliverables: [
        "Deal terms agreed ($6K / 4 milestones)",
        "Timeline locked (sprint Mar 9, store submit wk Mar 28)",
        "Full app flow & nav structure",
        "All orientation screen copy finalized",
        "5 search portal descriptions in copy",
        "Brand direction & design kit",
        "All external URLs (privacy, terms, resources, Softr)",
        "Logo & app icon from client",
      ],
      completionCriteria: "All 23 pre-sprint items resolved — 0 waiting items remaining.",
      stories: [
        { id: "ps-1", title: "Deal terms ($6K / 4 milestones)", status: "done", notes: "Agreed Mar 2", createdAt: "2026-03-02T00:00:00Z", completedAt: "2026-03-02T00:00:00Z" },
        { id: "ps-2", title: "Timeline (sprint Mar 9)", status: "done", notes: "Store submit wk Mar 28", createdAt: "2026-03-02T00:00:00Z", completedAt: "2026-03-02T00:00:00Z" },
        { id: "ps-3", title: "QA scope definitions", status: "done", notes: "Minor polish only", createdAt: "2026-03-03T00:00:00Z", completedAt: "2026-03-03T00:00:00Z" },
        { id: "ps-4", title: "Reviewer confirmed (Jan)", status: "done", notes: "Alex is gone", createdAt: "2026-03-03T00:00:00Z", completedAt: "2026-03-03T00:00:00Z" },
        { id: "ps-5", title: "App flow / nav structure", status: "done", notes: "4 tabs, full flow map", createdAt: "2026-03-03T00:00:00Z", completedAt: "2026-03-04T00:00:00Z" },
        { id: "ps-6", title: "Copy — 11 orientation screens", status: "done", notes: "Final locked v1", createdAt: "2026-03-03T00:00:00Z", completedAt: "2026-03-04T00:00:00Z" },
        { id: "ps-7", title: "Copy — static text / glossary", status: "done", notes: "Terms, tips, share text", createdAt: "2026-03-03T00:00:00Z", completedAt: "2026-03-04T00:00:00Z" },
        { id: "ps-8", title: "Search portal 1: immobiliare.it", status: "done", notes: "+ desc in copy", createdAt: "2026-03-04T00:00:00Z", completedAt: "2026-03-04T00:00:00Z" },
        { id: "ps-9", title: "Search portal 2: idealista.it", status: "done", notes: "+ desc in copy", createdAt: "2026-03-04T00:00:00Z", completedAt: "2026-03-04T00:00:00Z" },
        { id: "ps-10", title: "Search portal 3: casa.it", status: "done", notes: "+ desc in copy", createdAt: "2026-03-04T00:00:00Z", completedAt: "2026-03-04T00:00:00Z" },
        { id: "ps-11", title: "Search portal 4: gate-away.com", status: "done", notes: "+ desc in copy", createdAt: "2026-03-04T00:00:00Z", completedAt: "2026-03-04T00:00:00Z" },
        { id: "ps-12", title: "Search portal 5: subito.it", status: "done", notes: "+ desc in copy", createdAt: "2026-03-04T00:00:00Z", completedAt: "2026-03-04T00:00:00Z" },
        { id: "ps-13", title: "Color palette / brand direction", status: "done", notes: "Full design kit sent", createdAt: "2026-03-03T00:00:00Z", completedAt: "2026-03-05T00:00:00Z" },
        { id: "ps-14", title: "Softr directory URL", status: "done", notes: "federico42969.softr.app", outputUrl: "https://federico42969.softr.app", createdAt: "2026-03-04T00:00:00Z", completedAt: "2026-03-05T00:00:00Z" },
        { id: "ps-15", title: "Privacy policy URL", status: "done", notes: "doleright.com/privacy", outputUrl: "https://doleright.com/privacy", createdAt: "2026-03-04T00:00:00Z", completedAt: "2026-03-05T00:00:00Z" },
        { id: "ps-16", title: "Terms of Use URL", status: "done", notes: "doleright.com/terms", outputUrl: "https://doleright.com/terms", createdAt: "2026-03-04T00:00:00Z", completedAt: "2026-03-05T00:00:00Z" },
        { id: "ps-17", title: "Disclaimer text", status: "done", notes: "Inline copy provided", createdAt: "2026-03-04T00:00:00Z", completedAt: "2026-03-05T00:00:00Z" },
        { id: "ps-18", title: "Contact info (About screen)", status: "done", notes: "info@primanovagroup.com", createdAt: "2026-03-04T00:00:00Z", completedAt: "2026-03-05T00:00:00Z" },
        { id: "ps-19", title: "Ebook external link", status: "done", notes: "doleright.com/resources", outputUrl: "https://doleright.com/resources", createdAt: "2026-03-04T00:00:00Z", completedAt: "2026-03-05T00:00:00Z" },
        { id: "ps-20", title: "Upwork contract / agreement", status: "done", createdAt: "2026-03-05T00:00:00Z", completedAt: "2026-03-05T00:00:00Z" },
        { id: "ps-21", title: "Logo (wordmark)", status: "todo", notes: "She's doing it → ~Mon", createdAt: "2026-03-05T00:00:00Z" },
        { id: "ps-22", title: "App icon", status: "todo", notes: "Same → Monday", createdAt: "2026-03-05T00:00:00Z" },
        { id: "ps-23", title: "QR code redirect URL", status: "todo", notes: "Never mentioned yet", createdAt: "2026-03-05T00:00:00Z" },
      ],
      dueDate: "2026-03-08",
      createdAt: "2026-03-01T00:00:00Z",
      order: 0,
    },
    {
      id: "m1-foundation",
      projectId: "doleright-mobile-app",
      title: "App Foundation, Navigation & UI Shell",
      description: "Core app scaffold, tab navigation (4 tabs per flow map), theming from design kit, and shared UI primitives.",
      status: "draft",
      amount: 1500,
      fundingSource: "upwork-escrow",
      fundingStatus: "funded",
      deliverables: [
        "Expo project scaffold with TypeScript",
        "Bottom-tab navigation (4 tabs per agreed flow map)",
        "Global theming from brand design kit",
        "Shared UI components (buttons, cards, modals)",
        "Splash screen with logo wordmark",
      ],
      completionCriteria: "App runs on iOS simulator with all tabs navigable and themed per brand kit.",
      stories: [],
      dueDate: "2026-03-14",
      createdAt: "2026-03-05T00:00:00Z",
      order: 1,
    },
    {
      id: "m2-orientation",
      projectId: "doleright-mobile-app",
      title: "Orientation Flow (11 Screens)",
      description: "11 orientation screens with finalized copy, search portal integration, glossary, and share functionality.",
      status: "draft",
      amount: 1500,
      fundingSource: "upwork-escrow",
      fundingStatus: "pending",
      deliverables: [
        "11 orientation screens with locked copy",
        "5 search portal cards (immobiliare, idealista, casa, gate-away, subito)",
        "Static text / glossary section",
        "Share text functionality",
        "Disclaimer integration",
      ],
      completionCriteria: "All 11 orientation screens render with correct copy, portals link out, glossary accessible.",
      stories: [],
      dueDate: "2026-03-21",
      createdAt: "2026-03-05T00:00:00Z",
      order: 2,
    },
    {
      id: "m3-resources",
      projectId: "doleright-mobile-app",
      title: "Resources, Directory & External Links",
      description: "Softr directory integration, ebook link, about/contact screen, privacy & terms pages.",
      status: "draft",
      amount: 1500,
      fundingSource: "upwork-escrow",
      fundingStatus: "pending",
      deliverables: [
        "Softr directory embed/link (federico42969.softr.app)",
        "Ebook external link (doleright.com/resources)",
        "About screen with contact info (info@primanovagroup.com)",
        "Privacy policy link (doleright.com/privacy)",
        "Terms of Use link (doleright.com/terms)",
        "QR code redirect integration",
      ],
      completionCriteria: "All external links functional, about screen complete, directory accessible.",
      stories: [],
      dueDate: "2026-03-25",
      createdAt: "2026-03-05T00:00:00Z",
      order: 3,
    },
    {
      id: "m4-qa-submission",
      projectId: "doleright-mobile-app",
      title: "QA, Final Builds & Store Submission",
      description: "Minor polish (per QA scope), final builds, and App Store submission by wk of Mar 28.",
      status: "draft",
      amount: 1500,
      fundingSource: "upwork-escrow",
      fundingStatus: "pending",
      deliverables: [
        "QA pass (minor polish scope only)",
        "App Store screenshots & metadata",
        "TestFlight beta build",
        "App Store submission",
      ],
      completionCriteria: "App submitted to App Store, TestFlight available for Jan's review.",
      stories: [],
      dueDate: "2026-03-28",
      createdAt: "2026-03-05T00:00:00Z",
      order: 4,
    },
  ],
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const MILESTONE_STATUS_CONFIG: Record<MilestoneStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "text-muted-foreground bg-muted/30 border-border" },
  active: { label: "Active", className: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  completed: { label: "Completed", className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  "on-hold": { label: "On Hold", className: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
}

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MilestonesContentProps {
  editable?: boolean
}

export function MilestonesContent({ editable = false }: MilestonesContentProps) {
  const [project, setProject] = useState<MilestoneProject>(DEMO_PROJECT)
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(
    new Set(project.milestones.filter((m) => m.status === "active").map((m) => m.id)),
  )
  const [showAddMilestone, setShowAddMilestone] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    amount: "",
    fundingSource: "upwork-escrow" as FundingSource,
    deliverables: "",
  })

  const [newStoryTitle, setNewStoryTitle] = useState<Record<string, string>>({})

  const totalBudget = project.milestones.reduce((s, m) => s + m.amount, 0)
  const funded = getTotalFunded(project)
  const spent = getTotalSpent(project)
  const projectProgress = getProjectProgress(project)

  function toggleMilestone(id: string) {
    setExpandedMilestones((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function updateStoryStatus(milestoneId: string, storyId: string, status: StoryStatus) {
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
  }

  function addStory(milestoneId: string) {
    const title = newStoryTitle[milestoneId]?.trim()
    if (!title) return

    const story: Story = {
      id: `s-${Date.now()}`,
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
    setNewStoryTitle((prev) => ({ ...prev, [milestoneId]: "" }))
  }

  function deleteStory(milestoneId: string, storyId: string) {
    setProject((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === milestoneId
          ? { ...m, stories: m.stories.filter((s) => s.id !== storyId) }
          : m,
      ),
    }))
    setOpenDropdown(null)
  }

  function addMilestone() {
    if (!newMilestone.title.trim()) return

    const milestone: Milestone = {
      id: `m-${Date.now()}`,
      projectId: project.id,
      title: newMilestone.title.trim(),
      description: newMilestone.description.trim() || undefined,
      status: "draft",
      amount: Number(newMilestone.amount) || 0,
      fundingSource: newMilestone.fundingSource,
      fundingStatus: "pending",
      deliverables: newMilestone.deliverables
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean),
      stories: [],
      createdAt: new Date().toISOString(),
      order: project.milestones.length,
    }

    setProject((prev) => ({
      ...prev,
      milestones: [...prev.milestones, milestone],
    }))
    setNewMilestone({ title: "", description: "", amount: "", fundingSource: "upwork-escrow", deliverables: "" })
    setShowAddMilestone(false)
  }

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
          { label: "Milestones", value: `${project.milestones.filter((m) => m.status === "completed").length} / ${project.milestones.length}` },
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
        {project.milestones.map((milestone) => {
          const expanded = expandedMilestones.has(milestone.id)
          const progress = getMilestoneProgress(milestone)
          const done = milestone.stories.filter((s) => s.status === "done").length
          const inProgress = milestone.stories.filter((s) => s.status === "in-progress" || s.status === "review").length
          const waiting = milestone.stories.filter((s) => s.status === "todo").length
          const blocked = milestone.stories.filter((s) => s.status === "blocked").length
          const statusCfg = MILESTONE_STATUS_CONFIG[milestone.status]

          return (
            <div key={milestone.id} className="border border-border/40 rounded-sm">
              <button
                onClick={() => toggleMilestone(milestone.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/10 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs text-muted-foreground shrink-0">M{milestone.order + 1}</span>
                  <span className={`inline-flex items-center px-2.5 py-1 border rounded-sm font-mono text-[10px] uppercase tracking-widest shrink-0 ${statusCfg.className}`}>
                    {statusCfg.label}
                  </span>
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
                        return (
                          <div key={story.id} className="flex items-center gap-3 px-3 py-2.5 group hover:bg-muted/10 transition-colors">
                            {editable && (
                              <GripVertical className="h-3.5 w-3.5 text-border shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-foreground truncate">{story.title}</span>
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
                                      onClick={() => setOpenDropdown(null)}
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
