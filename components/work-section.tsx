"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const caseStudies = [
  {
    title: "Seekr",
    category: "AI Mental Health",
    proven: "Users would pay for AI-powered mental health tools",
    outcome: "Raised seed round, launched beta to 500+ users",
    span: "col-span-2 row-span-2",
  },
  {
    title: "Guideline Buddy",
    category: "Mortgage Compliance",
    proven: "Mortgage pros need faster access to lending guidelines",
    outcome: "Active users across multiple lenders",
    span: "col-span-1 row-span-1",
  },
  {
    title: "AudienceLab",
    category: "Marketing SaaS",
    proven: "SMBs would switch tools for better attribution",
    outcome: "500 signups in first month, acquired by competitor",
    span: "col-span-1 row-span-2",
  },
  {
    title: "Realtime Voice Agents",
    category: "AI Voice SDK",
    proven: "Developers want easier voice agent integration",
    outcome: "Open-sourced, 2k+ GitHub stars",
    span: "col-span-2 row-span-1",
  },
  {
    title: "Grain Copilot",
    category: "AgTech AI",
    proven: "Farmers trust AI when uncertainty is explicit",
    outcome: "Deployed to farm co-op for sell/hold decisions",
    span: "col-span-1 row-span-1",
  },
  {
    title: "Prediction Engine",
    category: "Fintech",
    proven: "Arbitrage signals can be deterministic + guardrail-enforced",
    outcome: "Powers daily trading signals across prediction markets",
    span: "col-span-1 row-span-1",
  },
  {
    title: "Open Deep Research",
    category: "AI Research Tools",
    proven: "Users want structured output from AI research",
    outcome: "Active internal tool, considering productization",
    span: "col-span-2 row-span-1",
  },
  {
    title: "Office Profit",
    category: "Multi-Agent AI",
    proven: "AI agents can collaborate via democratic voting",
    outcome: "Novel architecture for trading simulations",
    span: "col-span-1 row-span-1",
  },
  {
    title: "Supermarket Puzzle",
    category: "Gamified Platform",
    proven: "Gamification drives engagement with product discovery",
    outcome: "98+ hub pages, Firebase analytics, active users",
    span: "col-span-1 row-span-1",
  },
  {
    title: "Approval Hub",
    category: "Mobile App",
    proven: "Mobile approval workflows increase response time",
    outcome: "React Native app with push notifications, deployed",
    span: "col-span-2 row-span-1",
  },
  {
    title: "MCP Servers",
    category: "AI Tooling",
    proven: "Custom tools extend AI agent capabilities",
    outcome: "Calendar, Gmail, Firebase integrations in production",
    span: "col-span-1 row-span-1",
  },
  {
    title: "Canelo Crawford",
    category: "Sports Analytics",
    proven: "Real-time odds tracking drives betting engagement",
    outcome: "Live odds scraping, Redis caching, email alerts",
    span: "col-span-1 row-span-1",
  },
  {
    title: "Assist AI",
    category: "AI Backend Infra",
    proven: "Multi-model AI backends need unified interfaces",
    outcome: "WebSockets, Pinecone RAG, speech-to-text, deployed",
    span: "col-span-2 row-span-1",
  },
  {
    title: "FurOnWheels",
    category: "Programmatic SEO",
    proven: "Location-based content scales organic traffic",
    outcome: "481+ city pages, breed/brand taxonomies, live",
    span: "col-span-1 row-span-1",
  },
]

export function WorkSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !gridRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        },
      )

      const cards = gridRef.current?.querySelectorAll("article")
      if (cards && cards.length > 0) {
        gsap.set(cards, { y: 60, opacity: 0 })
        gsap.to(cards, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="work" className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12">
      <div ref={headerRef} className="mb-16 flex items-end justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">02 / Case Studies</span>
          <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">RECENT SPRINTS</h2>
        </div>
        <p className="hidden md:block max-w-xs font-mono text-xs text-muted-foreground text-right leading-relaxed">
          Real projects. Real outcomes. Every sprint proved a key assumption.
        </p>
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[180px] md:auto-rows-[200px]"
      >
        {caseStudies.map((study, index) => (
          <WorkCard key={index} study={study} index={index} />
        ))}
      </div>
    </section>
  )
}

function WorkCard({
  study,
  index,
}: {
  study: {
    title: string
    category: string
    proven: string
    outcome: string
    span: string
  }
  index: number
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <article
      className={cn(
        "group relative border border-border/40 p-5 flex flex-col justify-between transition-all duration-500 cursor-pointer overflow-hidden",
        study.span,
        isHovered && "border-accent/60",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "absolute inset-0 bg-accent/5 transition-opacity duration-500",
          isHovered ? "opacity-100" : "opacity-0",
        )}
      />

      <div className="relative z-10">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{study.category}</span>
        <h3
          className={cn(
            "mt-3 font-[var(--font-bebas)] text-2xl md:text-4xl tracking-tight transition-colors duration-300",
            isHovered ? "text-accent" : "text-foreground",
          )}
        >
          {study.title}
        </h3>
      </div>

      <div className="relative z-10 space-y-3">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-accent mb-1">What we proved</div>
          <p className="font-mono text-xs text-muted-foreground leading-relaxed">{study.proven}</p>
        </div>
        <div
          className={cn(
            "transition-all duration-500",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          )}
        >
          <div className="font-mono text-[9px] uppercase tracking-widest text-accent mb-1">Outcome</div>
          <p className="font-mono text-xs text-muted-foreground leading-relaxed">{study.outcome}</p>
        </div>
      </div>

      <span
        className={cn(
          "absolute bottom-4 right-4 font-mono text-[10px] transition-colors duration-300",
          isHovered ? "text-accent" : "text-muted-foreground/40",
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div
        className={cn(
          "absolute top-0 right-0 w-12 h-12 transition-all duration-500",
          isHovered ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="absolute top-0 right-0 w-full h-[1px] bg-accent" />
        <div className="absolute top-0 right-0 w-[1px] h-full bg-accent" />
      </div>
    </article>
  )
}
