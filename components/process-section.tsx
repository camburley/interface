"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    number: "01",
    title: "Apply",
    description: "Fill out the form. I'll review and get back to you within 24 hours.",
    duration: "15 min",
  },
  {
    number: "02",
    title: "Scope Lock",
    description: "We hop on a call, agree on the vertical slice, and lock the scope. No surprises.",
    duration: "1 hour",
  },
  {
    number: "03",
    title: "Build + Deploy",
    description: "I build your MVP over 5 business days. You get daily updates and can jump in anytime.",
    duration: "5 days",
  },
  {
    number: "04",
    title: "Loom + Plan",
    description: "You get the deployed link, a Loom walkthrough, and a next-step plan. Ready to share.",
    duration: "Final day",
  },
]

export function ProcessSection() {
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
    <section ref={sectionRef} id="process" className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12 bg-accent/5">
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">03 / How It Works</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">THE PROCESS</h2>
      </div>

      <div ref={timelineRef} className="relative max-w-5xl">
        {/* Connection line */}
        <div className="hidden md:block absolute left-8 top-12 bottom-12 w-[2px] bg-border/40" />

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={step.number} className="process-step relative flex items-start gap-6">
              {/* Step marker */}
              <div className="flex-shrink-0 w-16 h-16 border-2 border-accent bg-background flex items-center justify-center relative z-10">
                <span className="font-mono text-sm font-bold text-accent">{step.number}</span>
              </div>

              {/* Step content */}
              <div className="flex-1 pt-2">
                <div className="flex items-baseline gap-4 mb-2">
                  <h3 className="font-[var(--font-bebas)] text-3xl tracking-tight">{step.title}</h3>
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                    {step.duration}
                  </span>
                </div>
                <p className="font-mono text-sm text-muted-foreground leading-relaxed max-w-2xl">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
