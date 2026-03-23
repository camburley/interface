/**
 * Seed 6 new projects (3 internal, 3 ops) with milestones and stories.
 * Run AFTER backfill-board-type.ts.
 * 
 * Run: npx tsx scripts/seed-internal-ops-projects.ts
 */

import { getFirebaseAdmin } from "../lib/firebase-admin"

interface SeedProject {
  id: string
  clientName: string
  projectName: string
  boardType: "internal" | "ops"
  milestones: {
    id: string
    title: string
    description: string
    order: number
    stories: { title: string; kind: "feature" | "bug" }[]
  }[]
}

const PROJECTS: SeedProject[] = [
  // ── INTERNAL (Products) ──────────────────────────
  {
    id: "bouncer-cash",
    clientName: "Cam Burley",
    projectName: "Bouncer.cash",
    boardType: "internal",
    milestones: [
      {
        id: "bouncer-m1",
        title: "Plaid Integration",
        description: "Connect bank accounts via Plaid API for transaction data",
        order: 0,
        stories: [
          { title: "Upload data protection documents to Plaid", kind: "feature" },
          { title: "Plaid API connection + account linking flow", kind: "feature" },
          { title: "Account sync — pull transactions into Firestore", kind: "feature" },
        ],
      },
      {
        id: "bouncer-m2",
        title: "Stripe Revenue Pipeline",
        description: "Connect Stripe to surface revenue data alongside expenses",
        order: 1,
        stories: [
          { title: "Stripe API connection + revenue data pull", kind: "feature" },
          { title: "Revenue categorization + display", kind: "feature" },
        ],
      },
      {
        id: "bouncer-m3",
        title: "Dashboard MVP",
        description: "Cash position view, transaction categorization, burn rate",
        order: 2,
        stories: [
          { title: "Cash position dashboard view", kind: "feature" },
          { title: "Transaction categorization engine", kind: "feature" },
          { title: "Burn rate + runway calculation", kind: "feature" },
        ],
      },
    ],
  },
  {
    id: "polymarket-bot",
    clientName: "Cam Burley",
    projectName: "Polymarket Arbitrage Bot",
    boardType: "internal",
    milestones: [
      {
        id: "pm-m1",
        title: "Core Stability",
        description: "Gas management, recovery sweeper, dual executor prevention",
        order: 0,
        stories: [
          { title: "Gas auto-refill cron (USDC.e → POL via QuickSwap)", kind: "feature" },
          { title: "Recovery sweeper — fix attemptRegistry permanent blacklist", kind: "bug" },
          { title: "Dual executor prevention (KillMode=control-group)", kind: "bug" },
        ],
      },
      {
        id: "pm-m2",
        title: "Performance Tuning",
        description: "Improve fill rates, edge detection, and strategy per family",
        order: 1,
        stories: [
          { title: "Sizing zero rate investigation + fix", kind: "bug" },
          { title: "Edge/depth parameter tuning", kind: "feature" },
          { title: "XRP strategy review — historically weakest family", kind: "feature" },
        ],
      },
      {
        id: "pm-m3",
        title: "Scaling",
        description: "Increase position sizing and expand to more market families",
        order: 2,
        stories: [
          { title: "Position sizing growth based on capital trajectory", kind: "feature" },
          { title: "Multi-family expansion research", kind: "feature" },
          { title: "Capital deployment strategy", kind: "feature" },
        ],
      },
    ],
  },
  {
    id: "supermarket-puzzle",
    clientName: "Cam Burley",
    projectName: "Supermarket Puzzle / Grocery Intelligence Index",
    boardType: "internal",
    milestones: [
      {
        id: "sp-m1",
        title: "Grocery Intelligence Index",
        description: "Pinecone vector catalog, agent-native API, WF integration demo",
        order: 0,
        stories: [
          { title: "Pinecone product catalog — full index build", kind: "feature" },
          { title: "Agent-native API — query interface for grocery agents", kind: "feature" },
          { title: "Whole Foods integration demo (live cart building)", kind: "feature" },
        ],
      },
      {
        id: "sp-m2",
        title: "Social & Backlinks",
        description: "Content strategy, SEO baseline, distribution channels",
        order: 1,
        stories: [
          { title: "Content strategy + editorial calendar", kind: "feature" },
          { title: "SEO baseline audit + backlink plan", kind: "feature" },
          { title: "Distribution channel setup (social + partnerships)", kind: "feature" },
        ],
      },
    ],
  },

  // ── OPS (Operations) ─────────────────────────────
  {
    id: "bob-ops",
    clientName: "Burley.ai",
    projectName: "Bob Operations",
    boardType: "ops",
    milestones: [
      {
        id: "bob-m1",
        title: "Morning Brief System",
        description: "Preflight gate, audio format, CFO section, board status integration",
        order: 0,
        stories: [
          { title: "Pre-flight gate checklist (morning-brief-preflight.md)", kind: "feature" },
          { title: "Audio format enforcement (TTS, never text-only)", kind: "feature" },
          { title: "CFO section — blockers, Polymarket, tax countdown", kind: "feature" },
          { title: "Board status integration — surface task counts in brief", kind: "feature" },
        ],
      },
      {
        id: "bob-m2",
        title: "Finance / CFO Function",
        description: "Ledger framework, bank PDF processing, tax deadline tracking",
        order: 1,
        stories: [
          { title: "Ledger framework — categories, accounts, rules", kind: "feature" },
          { title: "Bank PDF processing — extract + categorize transactions", kind: "feature" },
          { title: "Tax deadline tracking — Apr 15 (2025 filing + Q1 estimated)", kind: "feature" },
          { title: "CPA coordination workflow", kind: "feature" },
        ],
      },
      {
        id: "bob-m3",
        title: "Grocery Concierge",
        description: "WF playbook, Dutch Meadows monitoring, proactive cart building",
        order: 2,
        stories: [
          { title: "Whole Foods playbook — add-to-cart rules, product defaults", kind: "feature" },
          { title: "Dutch Meadows open-window monitoring (every heartbeat)", kind: "feature" },
          { title: "Proactive cart building from Robert's meal research", kind: "feature" },
        ],
      },
    ],
  },
  {
    id: "content-pipeline",
    clientName: "Burley.ai",
    projectName: "Content Pipeline",
    boardType: "ops",
    milestones: [
      {
        id: "cp-m1",
        title: "Writing System",
        description: "cam-writer skill, article queue, LinkedIn/Substack setup",
        order: 0,
        stories: [
          { title: "cam-writer skill tuning — voice calibration from session data", kind: "feature" },
          { title: "Article queue — 12 concepts from brain dump (prioritize top 3)", kind: "feature" },
          { title: "LinkedIn publishing setup + format", kind: "feature" },
          { title: "Substack publishing setup + format", kind: "feature" },
        ],
      },
    ],
  },
  {
    id: "agent-infra",
    clientName: "Burley.ai",
    projectName: "Agent Infrastructure",
    boardType: "ops",
    milestones: [
      {
        id: "ai-m1",
        title: "Agent Maturity",
        description: "PM role/agent design, Robert delegation, sub-agent orchestration",
        order: 0,
        stories: [
          { title: "PM agent role design — scope, permissions, board ownership", kind: "feature" },
          { title: "Robert delegation patterns — research, proposals, writing", kind: "feature" },
          { title: "Sub-agent orchestration — parallel task patterns", kind: "feature" },
        ],
      },
      {
        id: "ai-m2",
        title: "Monitoring & Reliability",
        description: "Heartbeat reliability, cron management, memory maintenance",
        order: 1,
        stories: [
          { title: "Heartbeat reliability — consistent sweep execution", kind: "feature" },
          { title: "Cron job management — inventory, health checks, cleanup", kind: "feature" },
          { title: "Memory maintenance — periodic MEMORY.md curation from daily logs", kind: "feature" },
        ],
      },
    ],
  },
]

async function main() {
  const { db } = getFirebaseAdmin()

  for (const project of PROJECTS) {
    // Check if project already exists
    const existing = await db.collection("milestone_projects").doc(project.id).get()
    if (existing.exists) {
      console.log(`⚠ Project "${project.id}" already exists — skipping`)
      continue
    }

    // Create milestone_project
    await db.collection("milestone_projects").doc(project.id).set({
      clientName: project.clientName,
      projectName: project.projectName,
      boardType: project.boardType,
      createdAt: new Date().toISOString(),
    })
    console.log(`✓ Created project: ${project.projectName} (${project.boardType})`)

    // Create milestones + stories
    for (const ms of project.milestones) {
      await db.collection("milestones").doc(ms.id).set({
        projectId: project.id,
        title: ms.title,
        description: ms.description,
        status: "draft",
        amount: 0,
        fundingSource: "self-funded",
        fundingStatus: "funded",
        deliverables: [],
        completionCriteria: "",
        dueDate: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
        order: ms.order,
      })
      console.log(`  ✓ Milestone: ${ms.title}`)

      for (const story of ms.stories) {
        await db.collection("stories").add({
          milestoneId: ms.id,
          title: story.title,
          status: "todo",
          kind: story.kind,
          placeholder: false,
          notes: "",
          createdAt: new Date().toISOString(),
        })
        console.log(`    ✓ Story: ${story.title}`)
      }
    }
  }

  console.log("\nDone. All projects seeded.")
}

main().catch(console.error)
