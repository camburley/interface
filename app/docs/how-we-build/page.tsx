import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How We Build — Burley",
  description:
    "A quick map of the platform we build client projects on. Vercel, Supabase, Firebase, branch-based preview deploys, test credentials, and how you can follow along.",
  openGraph: {
    title: "How We Build — Burley",
    description:
      "A quick map of the platform we build client projects on. Vercel, branch-based previews, databases, test creds, and how to follow along.",
    url: "https://burley.ai/docs/how-we-build",
    siteName: "Burley",
    type: "article",
  },
  alternates: {
    canonical: "https://burley.ai/docs/how-we-build",
  },
}

const serif = "font-editorial-serif"

const asciiEnvs = `┌──────────────── TRADITIONAL ────────────────┐
│                                             │
│   dev.app.com   ──▶  its own DB + creds     │
│   stage.app.com ──▶  its own DB + creds     │
│   app.com       ──▶  its own DB + creds     │
│                                             │
│   Slow. Manual. One stage per team.         │
└─────────────────────────────────────────────┘

┌────────────── HOW WE SHIP ──────────────────┐
│                                             │
│   main branch   ──▶  app.com  (PROD)        │
│                                             │
│   feature/x    ──▶  app-git-feature-x.      │
│                     vercel.app (PREVIEW)    │
│                                             │
│   feature/y    ──▶  app-git-feature-y.      │
│                     vercel.app (PREVIEW)    │
│                                             │
│   1,000 preview URLs. Each one shareable.   │
└─────────────────────────────────────────────┘`

const asciiStack = `┌─────────── YOUR PROJECT ON BURLEY ──────────┐
│                                             │
│   FRONTEND  Next.js on Vercel               │
│   HOSTING   camburley's Vercel team         │
│   DB        one of:                         │
│              · Firebase                     │
│              · Supabase                     │
│              · Postgres                     │
│              · SQLite (small projects)      │
│   AUTH      tied to the DB choice           │
│   CI        GitHub Actions + Vercel checks  │
│                                             │
└─────────────────────────────────────────────┘`

const asciiCreds = `┌──────── TEST CREDENTIALS BY DEFAULT ────────┐
│                                             │
│   Stage 1  Burley sets up test creds        │
│           (Stripe test, sandbox APIs).      │
│                                             │
│   Stage 2  Feature built + QA'd on test.    │
│                                             │
│   Stage 3  You drop live creds ─▶ we open   │
│           a task to swap them in.           │
│                                             │
│   Nothing touches live money until you      │
│   say go.                                   │
└─────────────────────────────────────────────┘`

const asciiFollow = `┌─────────── HOW YOU CAN FOLLOW ALONG ────────┐
│                                             │
│   · Read-only GitHub access on the repo     │
│   · Prod link + rolling dev preview link    │
│   · Board at burley.ai shows every task     │
│                                             │
│   You do NOT need a Vercel account.         │
│   Preview links are open by URL.            │
└─────────────────────────────────────────────┘`

function Ascii({ children }: { children: string }) {
  return (
    <pre className="font-mono text-[12px] sm:text-[13px] leading-[1.45] bg-foreground/5 border border-foreground/10 p-5 overflow-x-auto text-foreground/85" style={{ margin: "0 0 24px" }}>
      {children}
    </pre>
  )
}

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className={`${serif} text-[30px] font-bold leading-[37.5px] text-foreground`} style={{ margin: "36px 0 12px" }}>
      {children}
    </h2>
  )
}

function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`${serif} text-[20px] font-normal leading-[30px] text-foreground/90 ${className ?? ""}`} style={{ margin: "0 0 20px" }}>
      {children}
    </p>
  )
}

export default function HowWeBuildPage() {
  return (
    <div className="max-w-[736px] mx-auto px-6" style={{ paddingTop: "80px", paddingBottom: "64px" }}>
      <header style={{ marginBottom: "32px" }}>
        <p className={`${serif} text-[14px] uppercase tracking-widest text-foreground/40`} style={{ marginBottom: "12px" }}>
          Docs
        </p>
        <h1 className={`${serif} text-[48px] font-normal leading-[1.1] text-foreground`} style={{ marginBottom: "16px" }}>
          How We Build
        </h1>
        <p className={`${serif} text-[22px] font-normal leading-[32px] text-foreground/50`}>
          A quick map of the platform your project lives on, so you can plan around it with confidence.
        </p>
      </header>

      <P>
        If you have worked at a typical software company, your mental model of “staging” is probably three separate environments. A dev environment, a stage environment, a production environment. Each with its own database, its own credentials, its own login. You request access to each one.
      </P>

      <P>
        We work differently. Not better, just faster and more dynamic. Here is the shape of it.
      </P>

      <H2 id="environments">Environments are branches, not boxes</H2>

      <Ascii>{asciiEnvs}</Ascii>

      <P>
        Every branch in the GitHub repo gets its own preview deployment on Vercel. You do not have to stand up a new environment to show a client a change. You push a branch, Vercel builds a URL, you share the link. Production is whatever is on <code className="font-mono text-[0.9em] bg-foreground/10 px-1.5 py-0.5">main</code>.
      </P>

      <P>
        That means there is no single “dev” environment with its own credentials. Dev is whichever preview URL we are currently walking through together. When we are done testing a feature, that branch merges to main and the preview URL is gone.
      </P>

      <H2 id="stack">What your project is built on</H2>

      <Ascii>{asciiStack}</Ascii>

      <P>
        Most of our JavaScript frontends ship on Vercel under the <code className="font-mono text-[0.9em] bg-foreground/10 px-1.5 py-0.5">camburley’s Team</code> account. All client projects sit inside one Pro team, scoped per-project. Databases are picked per project based on the needs of the feature set. Firebase and Supabase are the most common. We pull in Postgres or SQLite when a project calls for it.
      </P>

      <H2 id="credentials">Test credentials by default</H2>

      <Ascii>{asciiCreds}</Ascii>

      <P>
        When a project needs a third-party service like Stripe, analytics, or a payment processor, we wire it up on the test or sandbox tier first. The feature gets built and QA’d against test keys. When you are ready to go live, you share the production credentials and we open a task to swap them in. This keeps staging safe and makes the cutover to production a single, deliberate step.
      </P>

      <H2 id="follow-along">How you can follow along</H2>

      <Ascii>{asciiFollow}</Ascii>

      <P>
        You do not need a Vercel account to see our work. Preview URLs are shareable by link. If you want to read the code as it ships, ask for read-only access to the GitHub repo and we will add you. If you want to see the work itself, the board at <Link className="underline" href="/">burley.ai</Link> tracks every task from todo to done.
      </P>

      <H2 id="why">Why this matters</H2>

      <P>
        Traditional staging gives you a fixed number of environments and a queue of people waiting to use them. Branch-based previews give you one environment per idea, ready the moment someone needs to look at it. The trade-off is that the mental model is different. That is what this page is for.
      </P>

      <P className={`${serif} text-[18px] text-foreground/50`}>
        Questions on any of this? Reply to any Burley email and we’ll walk it through.
      </P>
    </div>
  )
}

export const dynamic = "force-static"
