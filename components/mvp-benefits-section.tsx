"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const benefits = [
  {
    number: "01",
    title: "A deployed, working link",
    description: "Not a prototype. Not a mockup. A real product you can share with investors, users, or teammates.",
  },
  {
    number: "02",
    title: "Loom walkthrough video",
    description: "I explain what I built, why, and how to use it. Perfect for pitching or onboarding your team.",
  },
  {
    number: "03",
    title: "Next-step plan",
    description: "A prioritized roadmap of what to build next, based on what we learned during the sprint.",
  },
  {
    number: "04",
    title: "Full source code",
    description: "Clean, commented code in a GitHub repo. You own everything. No vendor lock-in.",
  },
  {
    number: "05",
    title: "Direct access to me",
    description: "No project managers. No account executives. Just you and me on Slack throughout the sprint.",
  },
  {
    number: "06",
    title: "Fast turnaround",
    description: "5 business days from kickoff to delivery. Most sprints finish on schedule.",
  },
]

export function MvpBenefitsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      if (headerRef.current) {
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
      }

      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll("article")
        gsap.from(cards, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="mvp-sprint" className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12">
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">01 / What You Get</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">WHAT YOU WALK AWAY WITH</h2>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit) => (
          <article
            key={benefit.number}
            className="group border border-border/40 p-6 hover:border-accent/60 transition-all duration-300"
          >
            <div className="font-mono text-xs uppercase tracking-widest text-accent mb-4">{benefit.number}</div>
            <h3 className="font-[var(--font-bebas)] text-2xl tracking-tight mb-3 group-hover:text-accent transition-colors">
              {benefit.title}
            </h3>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed">{benefit.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
