"use client"

import type { ChangeEvent, FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { AnimatedNoise } from "@/components/animated-noise"

gsap.registerPlugin(ScrollTrigger)

const pricingTiers = [
  {
    name: "Starter",
    price: "$2.5k",
    description: "For founders who need a credible first setup without a month-long onboarding loop.",
    details: ["1 workflow audit", "Initial claw configuration", "1 async feedback round"],
  },
  {
    name: "Operator",
    price: "$5k",
    description: "For teams that want a production-ready setup and clearer handoff for operators.",
    details: ["End-to-end implementation", "Team onboarding docs", "2 weeks of async support"],
  },
  {
    name: "Embedded",
    price: "Custom",
    description: "For teams integrating OpenClaw deeply into daily operations, QA, and internal tooling.",
    details: ["Custom workflows", "Internal enablement", "Rollout strategy and support"],
  },
]

const features = [
  {
    title: "OpenClaw-native setup",
    body: "Built around the actual product constraints so your team gets a setup that works in the real world, not in a sales demo.",
  },
  {
    title: "Fast implementation",
    body: "Clear scope, direct execution, and a short path from idea to a working internal system your team can test immediately.",
  },
  {
    title: "Operator-first UX",
    body: "Flows are designed for the people who will use them every day, with attention to edge cases, not just screenshots.",
  },
  {
    title: "Audit + cleanup",
    body: "If you already started, I can untangle the current setup, remove confusion, and reframe the system around outcomes.",
  },
  {
    title: "Documentation included",
    body: "Every engagement ends with plain-language notes so your team understands what was built and how to keep it running.",
  },
  {
    title: "Direct with Cam",
    body: "No handoff chain, no account manager, no translation loss. You work directly with the person building the system.",
  },
]

const testimonials = [
  "“The market wants people with taste who can actually ship.”",
  "— inspired by Andrej Karpathy",
]

type FormData = {
  name: string
  email: string
  company: string
  teamSize: string
  message: string
}

const initialFormData: FormData = {
  name: "",
  email: "",
  company: "",
  teamSize: "",
  message: "",
}

export default function ClawPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData)

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.batch(".fade-up", {
        start: "top 90%",
        once: true,
        onEnter: (elements) => {
          gsap.fromTo(
            elements,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: "power3.out",
            },
          )
        },
      })
    })

    return () => ctx.revert()
  }, [])

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent("SetupClaw Inquiry")
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.company}\nTeam Size: ${formData.teamSize}\n\nMessage:\n${formData.message}`,
    )

    return `mailto:cam@burley.ai?subject=${subject}&body=${body}`
  }, [formData])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    window.location.href = mailtoHref
  }

  const handleChange =
    (field: keyof FormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground font-mono">
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(to right, white 1px, transparent 1px),
            linear-gradient(to bottom, white 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      <AnimatedNoise className="z-10" opacity={0.03} />

      <div className="relative z-20">
        <header className="border-b border-border/70">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 md:px-10">
            <Link href="/" className="text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground">
              Burley
            </Link>
            <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.25em] text-muted-foreground md:flex">
              <a href="#pricing" className="transition-colors hover:text-foreground">
                Pricing
              </a>
              <a href="#features" className="transition-colors hover:text-foreground">
                Features
              </a>
              <a href="#contact" className="transition-colors hover:text-foreground">
                Contact
              </a>
            </nav>
            <a
              href="#contact"
              className="border border-accent px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-accent transition-colors hover:bg-accent hover:text-background"
            >
              Start Setup
            </a>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="fade-up flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <span className="inline-flex items-center gap-2 border border-border bg-card px-3 py-2 text-foreground">
              <span aria-hidden="true">🦀</span>
              SetupClaw
            </span>
            <span className="border border-accent/50 bg-accent/10 px-3 py-2 text-accent">Built on OpenClaw</span>
          </div>

          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] lg:items-start">
            <div>
              <div className="fade-up">
                <div className="font-[var(--font-bebas)] text-[clamp(4rem,14vw,9rem)] italic leading-[0.82] tracking-tight">
                  SetupClaw
                </div>
                <h1 className="mt-6 max-w-4xl text-3xl leading-tight text-foreground md:text-5xl">
                  Launch OpenClaw faster with a setup that your team can actually operate.
                </h1>
                <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                  I help founders and internal teams stand up OpenClaw workflows, clean up messy implementations, and
                  turn vague automation ideas into working systems. Fast, direct, and production-minded.
                </p>
              </div>

              <div className="fade-up mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center border border-accent bg-accent px-6 py-3 text-xs uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90"
                >
                  Request Setup
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center border border-border px-6 py-3 text-xs uppercase tracking-[0.25em] text-foreground transition-colors hover:border-foreground"
                >
                  Back to Burley
                </Link>
              </div>

              <div className="fade-up mt-12 max-w-xl border border-border bg-card/60 p-6">
                <p className="text-sm leading-7 text-foreground">{testimonials[0]}</p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{testimonials[1]}</p>
              </div>
            </div>

            <aside className="fade-up border border-border bg-card/50 p-6 md:p-8">
              <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">What you get</div>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-foreground">
                <li>Scoped implementation around your real workflow and team constraints.</li>
                <li>Recommendations for what should be automated, what should stay manual, and why.</li>
                <li>Plain-language docs so operators are not dependent on tribal knowledge.</li>
              </ul>
              <div className="mt-8 border-t border-border pt-6 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Typical engagements start within days, not weeks.
              </div>
            </aside>
          </div>
        </section>

        <section id="pricing" className="border-t border-border/70">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
            <div className="fade-up max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.3em] text-accent">Pricing</p>
              <h2 className="mt-4 text-3xl text-foreground md:text-4xl">Three ways to get SetupClaw live.</h2>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                Pick the level that matches how much implementation, cleanup, and team enablement you need right now.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {pricingTiers.map((tier) => (
                <article key={tier.name} className="fade-up flex h-full flex-col border border-border bg-card/50 p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{tier.name}</p>
                      <h3 className="mt-3 text-3xl text-foreground">{tier.price}</h3>
                    </div>
                    <div className="bg-accent px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-background">Setup</div>
                  </div>
                  <p className="mt-6 text-sm leading-7 text-muted-foreground">{tier.description}</p>
                  <ul className="mt-8 space-y-3 text-sm leading-7 text-foreground">
                    {tier.details.map((detail) => (
                      <li key={detail} className="border-t border-border pt-3">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-border/70">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
            <div className="fade-up max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.3em] text-accent">Features</p>
              <h2 className="mt-4 text-3xl text-foreground md:text-4xl">Built for real operators, not vanity automation.</h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className="fade-up border border-border bg-card/40 p-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm text-background">
                    +
                  </div>
                  <h3 className="mt-6 text-xl text-foreground">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-border/70">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:px-10 lg:grid-cols-[0.8fr_minmax(0,1fr)]">
            <div className="fade-up">
              <p className="text-[11px] uppercase tracking-[0.3em] text-accent">Contact</p>
              <h2 className="mt-4 text-3xl text-foreground md:text-4xl">Tell me what your OpenClaw setup needs to do.</h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
                If you already know the pain points, send them. If not, describe the current workflow and where things
                break down. I&apos;ll reply with the clearest next step.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="fade-up border border-border bg-card/50 p-6 md:p-8">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Name</span>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleChange("name")}
                    className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                    placeholder="Your name"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Email</span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                    placeholder="you@company.com"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Company</span>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={handleChange("company")}
                    className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                    placeholder="Company name"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Team Size</span>
                  <input
                    type="text"
                    value={formData.teamSize}
                    onChange={handleChange("teamSize")}
                    className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                    placeholder="e.g. 3 operators"
                  />
                </label>
              </div>

              <label className="mt-5 block">
                <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Message</span>
                <textarea
                  value={formData.message}
                  onChange={handleChange("message")}
                  className="mt-2 min-h-40 w-full resize-y border border-border bg-background px-4 py-3 text-sm leading-7 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                  placeholder="What are you trying to automate, clean up, or launch?"
                  required
                />
              </label>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center border border-accent bg-accent px-6 py-3 text-xs uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90"
                >
                  Email Inquiry
                </button>
                <a href={mailtoHref} className="text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground">
                  Use your mail app
                </a>
              </div>
            </form>
          </div>
        </section>

        <footer className="border-t border-border/70">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-[11px] uppercase tracking-[0.25em] text-muted-foreground md:flex-row md:items-center md:justify-between md:px-10">
            <div>SetupClaw by Burley</div>
            <div>OpenClaw implementation, cleanup, and rollout</div>
            <a href="mailto:cam@burley.ai" className="transition-colors hover:text-foreground">
              cam@burley.ai
            </a>
          </div>
        </footer>
      </div>
    </main>
  )
}
