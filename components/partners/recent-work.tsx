"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const categories = [
  "Feature work",
  "Bug fixes",
  "Redesigns",
  "Internal tools",
  "Dashboards",
  "Integrations",
  "Automation",
  "Refactors",
  "Admin panels",
  "Landing pages",
  "API work",
  "Workflow improvements",
]

export function PartnersRecentWork() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.from(ref.current!.querySelector(".work-content"), {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="relative py-32 px-6 md:px-12 lg:px-28">
      <div className="work-content max-w-4xl">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">04 / What Fits Well</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">
          STRONG FIT FOR<br />QUEUE-BASED DELIVERY
        </h2>

        <div className="mt-10 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <span
              key={cat}
              className="border border-border/40 px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-accent/40 hover:text-foreground transition-colors duration-200"
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="mt-10">
          <a
            href="/"
            className="group inline-flex items-center gap-3 font-mono text-sm text-accent hover:text-foreground transition-colors"
          >
            See case studies on burley.ai →
          </a>
        </div>
      </div>
    </section>
  )
}
