/**
 * Seed milestones and stories into Firebase.
 *
 * Usage:
 *   npx tsx scripts/seed-milestones.ts
 *
 * Requires env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */

import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
  console.error("Missing Firebase credentials in env")
  process.exit(1)
}

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      })

const db = getFirestore(app)

const PROJECT_ID = "doleright-mobile-app"

interface SeedStory {
  id: string
  title: string
  status: string
  placeholder?: boolean
  notes?: string
  outputUrl?: string
  specUrl?: string
  createdAt: string
  completedAt?: string
}

interface SeedMilestone {
  id: string
  title: string
  description: string
  status: string
  amount: number
  fundingSource: string
  fundingStatus: string
  deliverables: string[]
  completionCriteria: string
  dueDate: string
  createdAt: string
  completedAt?: string
  order: number
  stories: SeedStory[]
}

const milestones: SeedMilestone[] = [
  {
    id: "m0-presprint",
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
    dueDate: "2026-03-08",
    createdAt: "2026-03-01T00:00:00Z",
    order: 0,
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
      {
        id: "ps-19",
        title: "Ebook external link",
        status: "done",
        placeholder: true,
        notes: "Placeholder URL for now. Jan will send the final Amazon Kindle link next week.",
        outputUrl: "https://dolceright.com/resources",
        createdAt: "2026-03-04T00:00:00Z",
        completedAt: "2026-03-05T00:00:00Z",
      },
      { id: "ps-20", title: "Upwork contract / agreement", status: "done", createdAt: "2026-03-05T00:00:00Z", completedAt: "2026-03-05T00:00:00Z" },
      { id: "ps-21", title: "Logo (wordmark)", status: "todo", notes: "She's doing it → ~Mon", createdAt: "2026-03-05T00:00:00Z" },
      { id: "ps-22", title: "App icon", status: "todo", notes: "Same → Monday", createdAt: "2026-03-05T00:00:00Z" },
      { id: "ps-23", title: "QR code redirect URL", status: "todo", notes: "Never mentioned yet", createdAt: "2026-03-05T00:00:00Z" },
    ],
  },
  {
    id: "m1-foundation",
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
    dueDate: "2026-03-14",
    createdAt: "2026-03-05T00:00:00Z",
    order: 1,
    stories: [],
  },
  {
    id: "m2-orientation",
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
    dueDate: "2026-03-21",
    createdAt: "2026-03-05T00:00:00Z",
    order: 2,
    stories: [],
  },
  {
    id: "m3-resources",
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
    dueDate: "2026-03-25",
    createdAt: "2026-03-05T00:00:00Z",
    order: 3,
    stories: [],
  },
  {
    id: "m4-qa-submission",
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
    dueDate: "2026-03-28",
    createdAt: "2026-03-05T00:00:00Z",
    order: 4,
    stories: [],
  },
]

async function seed() {
  console.log("Seeding milestones for project:", PROJECT_ID)

  // Upsert the project doc
  await db.collection("milestone_projects").doc(PROJECT_ID).set(
    {
      id: PROJECT_ID,
      clientName: "Jan Savolainen",
      projectName: "dolceRight",
      createdAt: "2026-03-01T00:00:00Z",
    },
    { merge: true },
  )

  for (const m of milestones) {
    const { stories, id: milestoneId, ...milestoneData } = m
    console.log(`  Milestone: ${milestoneId} — ${m.title}`)

    await db
      .collection("milestones")
      .doc(milestoneId)
      .set({ ...milestoneData, projectId: PROJECT_ID }, { merge: true })

    for (const s of stories) {
      const { id: storyId, ...storyData } = s
      console.log(`    Story: ${storyId} — ${s.title}`)
      await db
        .collection("stories")
        .doc(storyId)
        .set(
          {
            ...storyData,
            milestoneId,
            projectId: PROJECT_ID,
            attachments: [],
          },
          { merge: true },
        )
    }
  }

  console.log("Done! Seeded", milestones.length, "milestones.")
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
