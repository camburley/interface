"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function PartnersRiskReversal() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.from(ref.current!.querySelectorAll(".risk-card"), {
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.8,
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
    <section ref={ref} className="relative py-24 px-6 md:px-12 lg:px-28 border-y border-border/30">
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="risk-card border border-border/40 p-8 text-center">
          <span className="text-3xl">⏸</span>
          <h3 className="mt-4 font-[var(--font-bebas)] text-2xl tracking-tight">Pause anytime</h3>
          <p className="mt-3 font-mono text-xs text-muted-foreground leading-relaxed">
            Temporarily pause your subscription whenever you need to. Your remaining days carry over. Pick back up when you&apos;re ready.
          </p>
        </div>
        <div className="risk-card border border-accent/40 bg-accent/5 p-8 text-center">
          <span className="text-3xl">🛡</span>
          <h3 className="mt-4 font-[var(--font-bebas)] text-2xl tracking-tight">Try it for a week</h3>
          <p className="mt-3 font-mono text-xs text-muted-foreground leading-relaxed">
            Not the right fit after the first week? Get a full refund, no questions asked. Zero risk.
          </p>
        </div>
      </div>
    </section>
  )
}
