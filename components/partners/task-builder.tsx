"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface SizedTask {
  title: string
  description: string
  category: string
  size: "S" | "M" | "L"
  acceptance: string
}

interface SizeResult {
  tasks: SizedTask[]
  summary: string
  warnings: string[]
}

const SIZE_LABELS: Record<string, { label: string; color: string }> = {
  S: { label: "Small", color: "text-emerald-400 border-emerald-400/40" },
  M: { label: "Medium", color: "text-amber-400 border-amber-400/40" },
  L: { label: "Large", color: "text-rose-400 border-rose-400/40" },
}

const CATEGORY_ICONS: Record<string, string> = {
  feature: "◈",
  integration: "⟷",
  design: "◻",
  infrastructure: "▣",
  fix: "⚡",
  automation: "⟳",
  api: "⌁",
  "internal-tool": "⊞",
  refactor: "↻",
}

const PLACEHOLDER_EXAMPLES = [
  "Build me a client portal where customers can log in, see their project status, upload files, and view invoices.",
  "I need a landing page with a waitlist, Stripe checkout, and an admin dashboard to manage users.",
  "We want to integrate our CRM with Slack notifications, a custom reporting dashboard, and automated email sequences.",
  "Create an internal tool for our ops team to manage inventory, track shipments, and generate weekly reports.",
]

export function PartnersTaskBuilder() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const taskCardsRef = useRef<HTMLDivElement>(null)

  const [description, setDescription] = useState("")
  const [result, setResult] = useState<SizeResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [placeholder] = useState(
    () => PLACEHOLDER_EXAMPLES[Math.floor(Math.random() * PLACEHOLDER_EXAMPLES.length)]
  )

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        x: -60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!result || !taskCardsRef.current) return
    const cards = taskCardsRef.current.querySelectorAll(".task-card")
    gsap.fromTo(
      cards,
      { opacity: 0, y: 24, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.08,
        duration: 0.5,
        ease: "power3.out",
      }
    )
  }, [result])

  const handleSubmit = useCallback(async () => {
    if (loading || description.trim().length < 10) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/partners/size-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong.")
        return
      }

      setResult(data)

      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      })
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [description, loading])

  const sizeBreakdown = result
    ? (["S", "M", "L"] as const).map((s) => ({
        size: s,
        count: result.tasks.filter((t) => t.size === s).length,
      })).filter((s) => s.count > 0)
    : []

  return (
    <section ref={sectionRef} id="task-builder" className="relative py-32 px-6 md:px-12 lg:px-28">
      <div ref={headerRef} className="mb-12">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
          / Size Your Project
        </span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">
          SEE HOW YOUR PROJECT
          <br />
          MAPS TO THE QUEUE
        </h2>
        <p className="mt-4 max-w-xl font-mono text-sm text-muted-foreground leading-relaxed">
          Describe what you want built. The task builder breaks it into standard-sized deliverables
          so you can see exactly how work moves through your lane.
        </p>
      </div>

      {/* Input area */}
      <div className="max-w-3xl">
        <div className="border border-border/40 bg-card/30 focus-within:border-accent/60 transition-colors duration-200">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b border-border/20">
            <div className="w-2 h-2 rounded-full bg-red-500/60" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
            <div className="w-2 h-2 rounded-full bg-green-500/60" />
            <span className="ml-2 font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">
              project.md
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={placeholder}
            rows={5}
            className="w-full bg-transparent px-4 py-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/30 resize-none focus:outline-none leading-relaxed"
          />
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/20">
            <span className="font-mono text-[10px] text-muted-foreground/40">
              {description.length > 0 ? `${description.length} chars` : "min 10 characters"}
            </span>
            <button
              onClick={handleSubmit}
              disabled={loading || description.trim().length < 10}
              className={cn(
                "px-6 py-2 font-mono text-xs uppercase tracking-widest transition-all duration-200",
                loading
                  ? "border border-accent/40 text-accent/40 cursor-wait"
                  : description.trim().length < 10
                    ? "border border-border/30 text-muted-foreground/30 cursor-not-allowed"
                    : "border border-accent text-accent hover:bg-accent hover:text-background"
              )}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block w-3 h-3 border border-accent/40 border-t-accent animate-spin rounded-full" />
                  Sizing...
                </span>
              ) : (
                "Size My Project"
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 border border-rose-500/40 bg-rose-500/5 px-4 py-3">
            <p className="font-mono text-xs text-rose-400">{error}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div ref={resultsRef} className="mt-16 max-w-4xl">
          {/* Summary line */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="font-[var(--font-bebas)] text-4xl text-accent">
                {result.tasks.length}
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                tasks identified
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-border/40" />
            <div className="flex items-center gap-3">
              {sizeBreakdown.map((s) => (
                <span
                  key={s.size}
                  className={cn(
                    "border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
                    SIZE_LABELS[s.size].color
                  )}
                >
                  {s.count} {SIZE_LABELS[s.size].label}
                </span>
              ))}
            </div>
          </div>

          {/* Task cards */}
          <div ref={taskCardsRef} className="space-y-3">
            {result.tasks.map((task, i) => (
              <div
                key={i}
                className="task-card border border-border/40 hover:border-accent/30 transition-colors duration-200"
              >
                <div className="flex items-start gap-4 p-5">
                  {/* Task number */}
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-border/40 font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Task content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h4 className="font-[var(--font-bebas)] text-lg tracking-tight">
                        {task.title}
                      </h4>
                      <span
                        className={cn(
                          "border px-1.5 py-0 font-mono text-[9px] uppercase tracking-widest leading-relaxed",
                          SIZE_LABELS[task.size]?.color || "text-muted-foreground border-border/40"
                        )}
                      >
                        {task.size}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50">
                        {CATEGORY_ICONS[task.category] || "◈"} {task.category}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                      {task.description}
                    </p>
                    <p className="mt-2 font-mono text-[10px] text-muted-foreground/50 leading-relaxed">
                      <span className="text-accent/60">Done when:</span> {task.acceptance}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Warnings */}
          {result.warnings && result.warnings.length > 0 && (
            <div className="mt-6 border border-amber-500/30 bg-amber-500/5 px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400 mb-2">
                Heads up
              </p>
              <ul className="space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i} className="font-mono text-xs text-amber-400/80 leading-relaxed">
                    → {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lane throughput */}
          <div className="mt-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 mb-6">
              {result.tasks.length} tasks in the queue — pick your lane
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <LaneCard
                name="Continuity"
                price="$1,995"
                detail="Lower throughput"
                highlighted={false}
              />
              <LaneCard
                name="Core"
                price="$4,995"
                detail="1 active task at a time"
                highlighted={true}
              />
              <LaneCard
                name="Priority"
                price="$7,995"
                detail="2 active tasks at a time"
                highlighted={false}
              />
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <a
              href="#book"
              className="border border-accent px-6 py-3 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-background transition-all duration-200"
            >
              Book an intro call
            </a>
            <button
              onClick={() => {
                setResult(null)
                setDescription("")
                sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }}
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Try another project →
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

function LaneCard({
  name,
  price,
  detail,
  highlighted,
}: {
  name: string
  price: string
  detail: string
  highlighted: boolean
}) {
  return (
    <div
      className={cn(
        "border p-5 text-center",
        highlighted ? "border-accent bg-accent/5" : "border-border/40"
      )}
    >
      {highlighted && (
        <span className="inline-block mb-3 border border-accent px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.3em] text-accent">
          Higher throughput
        </span>
      )}
      <h4 className="font-[var(--font-bebas)] text-2xl tracking-tight">{name}</h4>
      <p className="mt-1 font-[var(--font-bebas)] text-3xl text-accent">{price}</p>
      <p className="mt-1 font-mono text-[10px] text-muted-foreground/60">/month</p>
      <div className="mt-3 border-t border-border/20 pt-3">
        <p className="mt-1 font-mono text-xs text-muted-foreground/70">{detail}</p>
      </div>
    </div>
  )
}
