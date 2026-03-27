"use client"

import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const plans = [
  {
    name: "Standard",
    price: "$4,995",
    period: "/month",
    description: "One request at a time. Perfect for ongoing product development.",
    features: [
      "One request at a time",
      "Avg. 48 hour delivery",
      "Unlimited requests",
      "Unlimited revisions",
      "Your own dashboard",
      "Loom walkthroughs",
      "Direct Slack access",
      "Pause or cancel anytime",
    ],
    cta: "Get started",
    href: "#book",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$7,995",
    period: "/month",
    description: "Two requests at a time. For teams that move fast and need more throughput.",
    features: [
      "Two requests at a time",
      "Avg. 48 hour delivery",
      "Unlimited requests",
      "Unlimited revisions",
      "Your own dashboard",
      "Loom walkthroughs",
      "Direct Slack access",
      "Pause or cancel anytime",
      "Priority support",
    ],
    cta: "Get started",
    href: "#book",
    highlighted: true,
  },
]

export function PartnersPricing() {
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
    <section ref={sectionRef} id="pricing" className="relative py-32 px-6 md:px-12 lg:px-28">
      <div ref={headerRef} className="mb-16 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">03 / Pricing</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">
          ONE SUBSCRIPTION,<br />ENDLESS POSSIBILITIES
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "border p-8 flex flex-col",
              plan.highlighted
                ? "border-accent bg-accent/5"
                : "border-border/40"
            )}
          >
            {plan.highlighted && (
              <span className="inline-block self-start mb-4 border border-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                Most Popular
              </span>
            )}
            <h3 className="font-[var(--font-bebas)] text-3xl tracking-tight">{plan.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-[var(--font-bebas)] text-5xl md:text-6xl text-accent">{plan.price}</span>
              <span className="font-mono text-sm text-muted-foreground">{plan.period}</span>
            </div>
            <p className="mt-4 font-mono text-xs text-muted-foreground leading-relaxed">{plan.description}</p>

            <div className="mt-8 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">What&apos;s included</p>
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="text-accent mt-0.5 text-xs">✓</span>
                    <span className="font-mono text-sm text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <a
              href={plan.href}
              className={cn(
                "mt-8 block text-center py-3 font-mono text-xs uppercase tracking-widest transition-all duration-200",
                plan.highlighted
                  ? "bg-accent text-background hover:bg-accent/90"
                  : "border border-foreground/20 text-foreground hover:border-accent hover:text-accent"
              )}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50">
        Pause or cancel anytime · No contracts · Billing cycles are 31 days
      </p>
    </section>
  )
}
