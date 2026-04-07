"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const plans = [
  {
    name: "Continuity",
    price: "$1,995",
    priceId: "continuity",
    period: "/month",
    description: "For existing clients who want to keep momentum without a full build lane.",
    features: [
      "Unlimited queue",
      "Lower throughput",
      "Maintenance, fixes, and support",
      "Incremental improvements",
      "Async updates and delivery",
      "Pause or cancel anytime",
    ],
    highlighted: false,
  },
  {
    name: "Core",
    price: "$4,995",
    priceId: "core",
    period: "/month",
    description: "Best for steady product work, improvements, automation, and feature delivery.",
    features: [
      "Unlimited queue",
      "One active task at a time",
      "Standard tasks within 48 business hrs",
      "Async updates and delivery",
      "Your own board",
      "Loom walkthroughs",
      "Ongoing product improvements",
      "Pause or cancel anytime",
    ],
    highlighted: true,
  },
  {
    name: "Priority",
    price: "$7,995",
    priceId: "priority",
    period: "/month",
    description: "Heavier throughput for clients with multiple concurrent priorities.",
    features: [
      "Unlimited queue",
      "Two active tasks at a time",
      "Standard tasks within 48 business hrs",
      "Async updates and delivery",
      "Your own board",
      "Loom walkthroughs",
      "Multiple concurrent priorities",
      "Pause or cancel anytime",
    ],
    highlighted: false,
  },
]

export function PartnersPricing() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

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

  async function handleCheckout(priceId: string) {
    if (!agreedToTerms) return
    setLoadingPlan(priceId)
    try {
      const res = await fetch("/api/partners/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: priceId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error("Checkout error:", data.error)
      }
    } catch (err) {
      console.error("Checkout failed:", err)
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <section ref={sectionRef} id="pricing" className="relative py-32 px-6 md:px-12 lg:px-28">
      <div ref={headerRef} className="mb-16 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">03 / Lanes</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">
          CHOOSE YOUR LANE
        </h2>
        <p className="mt-4 max-w-xl mx-auto font-mono text-sm text-muted-foreground leading-relaxed">
          The subscription covers the lane, not a fixed quantity of hours. This is a managed delivery system, not hourly consulting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
                Recommended
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

            <button
              onClick={() => handleCheckout(plan.priceId)}
              disabled={loadingPlan === plan.priceId || !agreedToTerms}
              className={cn(
                "mt-8 block w-full text-center py-3 font-mono text-xs uppercase tracking-widest transition-all duration-200",
                plan.highlighted
                  ? "bg-accent text-background hover:bg-accent/90"
                  : "border border-foreground/20 text-foreground hover:border-accent hover:text-accent",
                (loadingPlan === plan.priceId || !agreedToTerms) && "opacity-50 cursor-not-allowed"
              )}
            >
              {loadingPlan === plan.priceId ? "Loading..." : "Get started"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <label className="flex items-start gap-3 cursor-pointer max-w-md">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded-sm border border-border/60 bg-transparent accent-accent cursor-pointer shrink-0"
          />
          <span className="font-mono text-xs text-muted-foreground leading-relaxed">
            I agree to the{" "}
            <Link
              href="/terms"
              target="_blank"
              className="text-accent hover:text-accent/80 underline underline-offset-2 transition-colors"
            >
              Terms of Service
            </Link>
          </span>
        </label>
      </div>

      <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50">
        Pause or cancel anytime · No contracts · Async by default
      </p>
    </section>
  )
}
