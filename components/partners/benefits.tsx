"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const benefits = [
  {
    icon: "⚡",
    title: "Unlimited queue",
    description: "Add as many tasks as you want. They sit in priority order. Your lane determines throughput.",
  },
  {
    icon: "◈",
    title: "Predictable monthly cost",
    description: "No hourly billing. No per-project quotes. No surprise invoices. One flat monthly rate.",
  },
  {
    icon: "→",
    title: "48hr turnaround",
    description: "Standard-sized tasks move within 48 business hours once active. Not weeks. Days.",
  },
  {
    icon: "◉",
    title: "Async by default",
    description: "Requests, updates, delivery, and revisions happen through the board. No recurring meetings required.",
  },
  {
    icon: "‖",
    title: "Pause anytime",
    description: "Going on vacation? Slow month? Pause your subscription and pick back up when ready.",
  },
  {
    icon: "✦",
    title: "100% yours",
    description: "Full source code. Full ownership. No vendor lock-in. Take it and run whenever you want.",
  },
]

export function PartnersBenefits() {
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
    <section ref={sectionRef} id="benefits" className="relative py-32 px-6 md:px-12 lg:px-28">
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">02 / Membership Benefits</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">
          IT&apos;S &quot;YOU&apos;LL NEVER GO<br />BACK&quot; BETTER
        </h2>
        <p className="mt-4 max-w-xl font-mono text-sm text-muted-foreground leading-relaxed">
          Built for founders, operators, and business owners who have ideas, updates, fixes, and tools they want shipped without hiring a full team or managing a traditional dev shop.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
        {benefits.map((b) => (
          <div key={b.title} className="border border-border/40 p-6 hover:border-accent/40 transition-colors duration-300">
            <span className="text-accent text-2xl">{b.icon}</span>
            <h3 className="mt-4 font-[var(--font-bebas)] text-xl tracking-tight">{b.title}</h3>
            <p className="mt-2 font-mono text-xs text-muted-foreground leading-relaxed">{b.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
