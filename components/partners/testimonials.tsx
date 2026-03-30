"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const reviews = [
  {
    quote:
      "Cam was an excellent developer to work with. As a non-technical founder, I really appreciated his patience, clarity, and willingness to explain things in plain English without ever making me feel rushed or out of my depth. His work was high quality, thorough, and delivered quickly. He was proactive about flagging potential issues, thoughtful about implementation decisions, and genuinely invested in building something solid — not just checking boxes.",
    project: "Prototype — Single Assessment Flow",
    rating: 5.0,
  },
  {
    quote:
      "This was an update to our app that Cam built, and as usual he did an excellent job. We are continuing to work with Cam on other projects and appreciate tremendously his guidance, attention to detail and his commitment to excellence.",
    project: "Updated Authentication Flow",
    rating: 5.0,
  },
  {
    quote:
      "I had the pleasure of working with Cam on building an Agentic AI powered B2B platform for the mortgage industry, and I can confidently say he is one of the best developers I've worked with. Clear communicator, solution oriented, professional, and committed to quality.",
    project: "Guideline Chatbot — Conversational UI",
    rating: 5.0,
  },
  {
    quote:
      "Very professional and communicates very well!",
    project: "Grain Price Prediction Tool",
    rating: 5.0,
  },
]

const projects = [
  { name: "Seekr", category: "AI Mental Health" },
  { name: "Guideline Buddy", category: "Mortgage Compliance" },
  { name: "AudienceLab", category: "Marketing SaaS" },
  { name: "Grain Copilot", category: "AgTech AI" },
  { name: "Prediction Engine", category: "Fintech" },
  { name: "Supermarket Puzzle", category: "Gamified Platform" },
  { name: "Open Deep Research", category: "AI Research" },
  { name: "Approval Hub", category: "Mobile App" },
  { name: "FurOnWheels", category: "Programmatic SEO" },
  { name: "Assist AI", category: "AI Backend" },
  { name: "MCP Servers", category: "AI Tooling" },
  { name: "Canelo Crawford", category: "Sports Analytics" },
]

function Stars() {
  return (
    <span className="inline-flex gap-0.5 text-accent text-xs">
      {"★★★★★"}
    </span>
  )
}

export function PartnersTestimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

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

      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll(".review-card")
        gsap.from(cards, {
          opacity: 0,
          y: 30,
          stagger: 0.12,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="proof" className="relative py-32 px-6 md:px-12 lg:px-28">
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
          / Track Record
        </span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">
          TRUSTED BY FOUNDERS
          <br />
          AND OPERATORS
        </h2>
      </div>

      {/* Reviews */}
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mb-16">
        {reviews.map((review, i) => (
          <div
            key={i}
            className="review-card border border-border/40 p-6 flex flex-col justify-between"
          >
            <div>
              <Stars />
              <p className="mt-4 font-mono text-sm text-foreground/80 leading-relaxed italic">
                &ldquo;{review.quote}&rdquo;
              </p>
            </div>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
              {review.project}
            </p>
          </div>
        ))}
      </div>

      {/* Projects shipped */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 mb-6">
          Products shipped
        </p>
        <div className="flex flex-wrap gap-3">
          {projects.map((p) => (
            <span
              key={p.name}
              className="border border-border/40 px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-accent/40 hover:text-foreground transition-colors duration-200"
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
