"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    number: "01",
    title: "Subscribe to a lane",
    description: "Choose the lane that matches your pace. No contracts, no onboarding calls required. Start adding tasks immediately.",
  },
  {
    number: "02",
    title: "Add tasks to your board",
    description: "Drop in as many tasks as you want. They sit in the queue in priority order. Reorder anytime as business needs change.",
  },
  {
    number: "03",
    title: "Work moves through",
    description: "Your lane determines how many tasks can be active at once. Standard-sized tasks move within 48 business hours. Review, request refinements, keep the queue moving.",
  },
]

export function PartnersHowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

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

      if (timelineRef.current) {
        const stepCards = timelineRef.current.querySelectorAll(".process-step")
        gsap.from(stepCards, {
          x: -40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="how-it-works" className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12 bg-accent/5">
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">01 / How It Works</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">
          THE WAY DEV SHOULD&apos;VE<br />BEEN DONE ALL ALONG
        </h2>
        <p className="mt-4 max-w-xl font-mono text-sm text-muted-foreground leading-relaxed">
          No scope documents. No project-by-project renegotiation. No constant meetings. Just a queue that moves.
        </p>
      </div>

      <div ref={timelineRef} className="relative max-w-5xl">
        <div className="hidden md:block absolute left-8 top-12 bottom-12 w-[2px] bg-border/40" />

        <div className="space-y-8">
          {steps.map((step) => (
            <div key={step.number} className="process-step relative flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 border-2 border-accent bg-background flex items-center justify-center relative z-10">
                <span className="font-mono text-sm font-bold text-accent">{step.number}</span>
              </div>

              <div className="flex-1 pt-2">
                <h3 className="font-[var(--font-bebas)] text-3xl tracking-tight mb-2">{step.title}</h3>
                <p className="font-mono text-sm text-muted-foreground leading-relaxed max-w-2xl">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
