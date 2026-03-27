"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    number: "01",
    title: "Subscribe",
    description: "Choose a plan and subscribe. No contracts, no onboarding calls required. You can start submitting requests immediately.",
  },
  {
    number: "02",
    title: "Request",
    description: "Add tasks to your board—features, bug fixes, integrations, new pages. One at a time or two in parallel, depending on your plan.",
  },
  {
    number: "03",
    title: "Receive",
    description: "Get production-grade builds delivered in ~48 hours on average. Each delivery includes a Loom walkthrough and full source code.",
  },
]

export function PartnersHowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

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

  return (
    <section ref={sectionRef} id="how-it-works" className="relative py-32 px-6 md:px-12 lg:px-28">
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">01 / How It Works</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">
          THE WAY DEV SHOULD&apos;VE<br />BEEN DONE ALL ALONG
        </h2>
        <p className="mt-4 max-w-xl font-mono text-sm text-muted-foreground leading-relaxed">
          No scope documents. No sprint planning meetings. No project managers. Just subscribe, submit, and receive production-grade software.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        {steps.map((step) => (
          <div key={step.number} className="border border-border/40 p-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">{step.number}</span>
            <h3 className="mt-4 font-[var(--font-bebas)] text-3xl tracking-tight">{step.title}</h3>
            <p className="mt-4 font-mono text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
