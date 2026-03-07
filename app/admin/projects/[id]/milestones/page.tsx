"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
  ChevronUp,
  Plus,
  GripVertical,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowLeft,
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
      id: "m1-foundation",
      projectId: "doleright-mobile-app",
      title: "App Foundation, Navigation & UI Shell",
      description: "Core app scaffold, tab navigation, theming, and shared UI primitives.",
      status: "completed",
      amount: 1500,
      fundingSource: "upwork-escrow",
      fundingStatus: "funded",
      deliverables: [
        "Expo project scaffold with TypeScript",
        "Bottom-tab navigation (Home, Quiz, Resources, Profile)",
        "Global theming & design tokens",
        "Shared UI components (buttons, cards, modals)",
        "Splash screen & app icon",
      ],
      completionCriteria: "App runs on iOS simulator with all tabs navigable and themed.",
      stories: [
        { id: "s1-1", title: "Expo init + TypeScript config", status: "done", createdAt: "2025-12-20T00:00:00Z", completedAt: "2025-12-20T00:00:00Z" },
        { id: "s1-2", title: "Bottom-tab navigator", status: "done", createdAt: "2025-12-20T00:00:00Z", completedAt: "2025-12-21T00:00:00Z" },
        { id: "s1-3", title: "Design tokens & theme provider", status: "done", createdAt: "2025-12-21T00:00:00Z", completedAt: "2025-12-21T00:00:00Z" },
        { id: "s1-4", title: "Shared button / card / modal components", status: "done", createdAt: "2025-12-21T00:00:00Z", completedAt: "2025-12-22T00:00:00Z" },
        { id: "s1-5", title: "Splash screen & app icon", status: "done", createdAt: "2025-12-22T00:00:00Z", completedAt: "2025-12-23T00:00:00Z" },
      ],
      dueDate: "2025-12-28",
      createdAt: "2025-12-18T00:00:00Z",
      completedAt: "2025-12-23T00:00:00Z",
      order: 0,
    },
    {
      id: "m2-orientation",
      projectId: "doleright-mobile-app",
      title: "Orientation Flow",
      description: "Quiz engine, scoring algorithm, results screen, recommendation cards, and upgrade gate.",
      status: "active",
      amount: 1500,
      fundingSource: "upwork-escrow",
      fundingStatus: "funded",
      deliverables: [
        "Multi-step quiz with progress indicator",
        "Scoring algorithm (section + composite)",
        "Results screen with bar chart breakdown",
        "Recommendation cards per section",
        "Pro upgrade gate + payment stub",
      ],
      completionCriteria: "User can complete quiz, view scored results, and see recommendations.",
      stories: [
        { id: "s2-1", title: "Quiz data model & question bank", status: "done", createdAt: "2026-01-02T00:00:00Z", completedAt: "2026-01-03T00:00:00Z" },
        { id: "s2-2", title: "Quiz stepper UI", status: "done", createdAt: "2026-01-02T00:00:00Z", completedAt: "2026-01-04T00:00:00Z" },
        { id: "s2-3", title: "Answer persistence (AsyncStorage)", status: "done", createdAt: "2026-01-03T00:00:00Z", completedAt: "2026-01-04T00:00:00Z" },
        { id: "s2-4", title: "Progress bar component", status: "done", createdAt: "2026-01-03T00:00:00Z", completedAt: "2026-01-04T00:00:00Z" },
        { id: "s2-5", title: "Scoring algorithm (per-section + composite)", status: "done", createdAt: "2026-01-04T00:00:00Z", completedAt: "2026-01-06T00:00:00Z" },
        { id: "s2-6", title: "Results screen layout", status: "done", createdAt: "2026-01-05T00:00:00Z", completedAt: "2026-01-07T00:00:00Z" },
        { id: "s2-7", title: "Bar chart breakdown component", status: "done", createdAt: "2026-01-06T00:00:00Z", completedAt: "2026-01-08T00:00:00Z" },
        { id: "s2-8", title: "Recommendation cards", status: "done", createdAt: "2026-01-07T00:00:00Z", completedAt: "2026-01-09T00:00:00Z" },
        { id: "s2-9", title: "WEAK badge removal per Jan feedback", status: "done", createdAt: "2026-01-18T00:00:00Z", completedAt: "2026-01-19T00:00:00Z" },
        { id: "s2-10", title: "Headline size reduction (10-15%)", status: "done", createdAt: "2026-01-18T00:00:00Z", completedAt: "2026-01-19T00:00:00Z" },
        { id: "s2-11", title: "Keyboard overlap fix", status: "done", createdAt: "2026-01-18T00:00:00Z", completedAt: "2026-01-20T00:00:00Z" },
        { id: "s2-12", title: "Card styling (gray bg, dividers, padding)", status: "in-progress", createdAt: "2026-01-18T00:00:00Z" },
        { id: "s2-13", title: "Scroll position audit", status: "in-progress", createdAt: "2026-01-18T00:00:00Z" },
        { id: "s2-14", title: "Upgrade screen scroll indicator", status: "todo", createdAt: "2026-01-18T00:00:00Z" },
        { id: "s2-15", title: "Restart button on Upsell (non-Pro)", status: "todo", createdAt: "2026-01-18T00:00:00Z" },
        { id: "s2-16", title: "Shortened disclaimer upstream", status: "todo", createdAt: "2026-01-18T00:00:00Z" },
        { id: "s2-17", title: "Pro upgrade gate + payment stub", status: "todo", createdAt: "2026-01-08T00:00:00Z" },
      ],
      dueDate: "2026-02-01",
      createdAt: "2026-01-01T00:00:00Z",
      order: 1,
    },
    {
      id: "m3-resources",
      projectId: "doleright-mobile-app",
      title: "Resources & External Integrations",
      description: "External resource links, alternatives logic, bar-scaling redesign, and analysis feature.",
      status: "draft",
      amount: 1500,
      fundingSource: "upwork-escrow",
      fundingStatus: "pending",
      deliverables: [
        "California Resources external links section",
        "Alternatives recommendation engine",
        "Bar-scaling visual redesign",
        "PlanRight analysis feature (session tracking)",
        "Auth flow restructure (remove login from app start)",
      ],
      completionCriteria: "All resource links functional, alternatives engine returns context-aware results, analysis feature tracks sessions.",
      stories: [
        { id: "s3-1", title: "California Resources link section", status: "todo", createdAt: "2026-01-20T00:00:00Z" },
        { id: "s3-2", title: "Alternatives conditional engine", status: "todo", createdAt: "2026-01-20T00:00:00Z", notes: "Reads quiz answers, checks contradictions, suppresses irrelevant pivots" },
        { id: "s3-3", title: "Bar-scaling visual algorithm", status: "todo", createdAt: "2026-01-20T00:00:00Z", notes: "More dramatic spread regardless of actual scores" },
        { id: "s3-4", title: "PlanRight analysis feature", status: "todo", createdAt: "2026-01-20T00:00:00Z", notes: "User history, session tracking, product intelligence" },
        { id: "s3-5", title: "Auth flow restructure", status: "todo", createdAt: "2026-01-20T00:00:00Z", notes: "Remove login from app start, combine account creation with payment at Pro upgrade" },
      ],
      dueDate: "2026-03-01",
      createdAt: "2026-01-20T00:00:00Z",
      order: 2,
    },
    {
      id: "m4-qa-submission",
      projectId: "doleright-mobile-app",
      title: "QA, Final Builds & Store Submission",
      description: "End-to-end testing, performance pass, app store assets, and submission.",
      status: "draft",
      amount: 1500,
      fundingSource: "upwork-escrow",
      fundingStatus: "pending",
      deliverables: [
        "Full device testing matrix (iPhone SE → Pro Max)",
        "Performance & memory audit",
        "App Store screenshots & metadata",
        "TestFlight beta build",
        "App Store submission",
      ],
      stories: [
        { id: "s4-1", title: "Device testing matrix", status: "todo", createdAt: "2026-01-20T00:00:00Z" },
        { id: "s4-2", title: "Performance & memory audit", status: "todo", createdAt: "2026-01-20T00:00:00Z" },
        { id: "s4-3", title: "App Store screenshot generation", status: "todo", createdAt: "2026-01-20T00:00:00Z" },
        { id: "s4-4", title: "App Store metadata & description", status: "todo", createdAt: "2026-01-20T00:00:00Z" },
        { id: "s4-5", title: "TestFlight beta distribution", status: "todo", createdAt: "2026-01-20T00:00:00Z" },
        { id: "s4-6", title: "App Store submission", status: "todo", createdAt: "2026-01-20T00:00:00Z" },
      ],
      dueDate: "2026-04-01",
      createdAt: "2026-01-20T00:00:00Z",
      order: 3,
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
// Page component
// ---------------------------------------------------------------------------

export default function MilestonesPage() {
  const [project, setProject] = useState<MilestoneProject>(DEMO_PROJECT)
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(
    new Set(project.milestones.filter((m) => m.status === "active").map((m) => m.id)),
  )
  const [showAddMilestone, setShowAddMilestone] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // New milestone form state
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    amount: "",
    fundingSource: "upwork-escrow" as FundingSource,
    deliverables: "",
  })

  // New story input state (per milestone)
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40 sticky top-0 z-30 backdrop-blur-sm bg-background/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Admin
            </Link>
            <span className="text-border">/</span>
            <span className="font-mono text-xs text-foreground">{project.clientName}</span>
            <span className="text-border">/</span>
            <span className="font-mono text-xs text-primary">{project.projectName}</span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest border border-border/50 px-2 py-0.5">
            Milestones
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Budget overview cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Budget", value: formatCurrency(totalBudget) },
            { label: "Funded", value: formatCurrency(funded), accent: funded > 0 },
            { label: "Completed", value: formatCurrency(spent), accent: spent > 0 },
            { label: "Milestones", value: `${project.milestones.filter((m) => m.status === "completed").length} / ${project.milestones.length}` },
          ].map((card) => (
            <div key={card.label} className="border border-border/40 p-5 space-y-1">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{card.label}</p>
              <p className={`font-mono text-2xl font-bold ${card.accent ? "text-emerald-400" : "text-foreground"}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Overall progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Project Progress</p>
            <p className="font-mono text-xs text-foreground">{projectProgress}%</p>
          </div>
          <div className="h-1.5 bg-muted/40 overflow-hidden">
            <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${projectProgress}%` }} />
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Milestones ({project.milestones.length})
            </p>
            <button
              onClick={() => setShowAddMilestone(!showAddMilestone)}
              className="flex items-center gap-1.5 font-mono text-xs text-primary hover:text-foreground transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Milestone
            </button>
          </div>

          {/* Add milestone dialog */}
          {showAddMilestone && (
            <div className="border border-primary/30 bg-primary/5 p-6 space-y-4">
              <p className="font-mono text-xs text-primary uppercase tracking-widest">New Milestone</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                    Title
                  </label>
                  <input
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone((p) => ({ ...p, title: e.target.value }))}
                    className="w-full bg-muted/20 border border-border/50 px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="Milestone title"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    value={newMilestone.amount}
                    onChange={(e) => setNewMilestone((p) => ({ ...p, amount: e.target.value }))}
                    className="w-full bg-muted/20 border border-border/50 px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="1500"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                    Description
                  </label>
                  <input
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone((p) => ({ ...p, description: e.target.value }))}
                    className="w-full bg-muted/20 border border-border/50 px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="What this milestone covers"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                    Funding Source
                  </label>
                  <select
                    value={newMilestone.fundingSource}
                    onChange={(e) => setNewMilestone((p) => ({ ...p, fundingSource: e.target.value as FundingSource }))}
                    className="w-full bg-muted/20 border border-border/50 px-4 py-2.5 font-mono text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  >
                    {(Object.keys(FUNDING_LABELS) as FundingSource[]).map((fs) => (
                      <option key={fs} value={fs}>
                        {FUNDING_LABELS[fs]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                    Deliverables (one per line)
                  </label>
                  <textarea
                    value={newMilestone.deliverables}
                    onChange={(e) => setNewMilestone((p) => ({ ...p, deliverables: e.target.value }))}
                    rows={3}
                    className="w-full bg-muted/20 border border-border/50 px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                    placeholder="First deliverable&#10;Second deliverable"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={addMilestone}
                  className="flex items-center gap-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-5 py-2.5 hover:bg-primary/90 transition-colors"
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
              <div key={milestone.id} className="border border-border/40">
                {/* Milestone header row */}
                <button
                  onClick={() => toggleMilestone(milestone.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="font-mono text-xs text-muted-foreground shrink-0">M{milestone.order + 1}</span>
                    <span className={`inline-flex items-center px-2.5 py-1 border font-mono text-[10px] uppercase tracking-widest shrink-0 ${statusCfg.className}`}>
                      {statusCfg.label}
                    </span>
                    <span className="font-mono text-sm text-foreground truncate">{milestone.title}</span>
                  </div>
                  <div className="flex items-center gap-5 shrink-0 ml-4">
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

                {/* Milestone body */}
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
                      <div className="h-1 bg-muted/40 overflow-hidden">
                        <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${progress}%` }} />
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
                            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
                              Deliverables
                            </p>
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
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
                        Stories / Items
                      </p>
                      <div className="border border-border/30 divide-y divide-border/20">
                        {milestone.stories.map((story) => {
                          const storyCfg = STORY_STATUS_CONFIG[story.status]
                          return (
                            <div key={story.id} className="flex items-center gap-3 px-3 py-2.5 group hover:bg-muted/10 transition-colors">
                              <GripVertical className="h-3.5 w-3.5 text-border shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />

                              {/* Title + links */}
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

                              {/* Status dropdown */}
                              <select
                                value={story.status}
                                onChange={(e) => updateStoryStatus(milestone.id, story.id, e.target.value as StoryStatus)}
                                className={`bg-transparent border-none font-mono text-[10px] uppercase tracking-widest cursor-pointer focus:outline-none ${storyCfg.className}`}
                              >
                                {STORY_STATUS_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {STORY_STATUS_CONFIG[opt].label}
                                  </option>
                                ))}
                              </select>

                              {/* Notes */}
                              {story.notes && (
                                <span className="hidden md:block font-mono text-[10px] text-muted-foreground truncate max-w-[200px]">
                                  {story.notes}
                                </span>
                              )}

                              {/* Actions dropdown */}
                              <div className="relative shrink-0">
                                <button
                                  onClick={() => setOpenDropdown(openDropdown === story.id ? null : story.id)}
                                  className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </button>
                                {openDropdown === story.id && (
                                  <div className="absolute right-0 top-7 z-20 border border-border bg-background shadow-lg min-w-[140px]">
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
                            </div>
                          )
                        })}

                        {/* Add story row */}
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
      </main>
    </div>
  )
}
