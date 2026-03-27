"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function PartnersBooking() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.from(ref.current!.querySelector(".booking-content"), {
        opacity: 0,
        y: 40,
        duration: 1,
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
    <section ref={ref} id="book" className="relative py-32 px-6 md:px-12 lg:px-28 border-t border-border/30">
      <div className="booking-content max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">06 / Get Started</span>
          <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">
            SEE IF BURLEY IS THE<br />RIGHT FIT FOR YOU
          </h2>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            Schedule a quick 15-minute intro call. No pressure, no pitch deck—just a conversation about what you&apos;re building.
          </p>
        </div>

        {/* Calendly embed placeholder — replace src with actual Calendly link */}
        <div className="max-w-2xl mx-auto border border-border/40 bg-card/50">
          <div className="p-12 text-center">
            <p className="font-mono text-xs text-muted-foreground/50 uppercase tracking-widest mb-6">
              Calendly embed goes here
            </p>
            <a
              href="mailto:cam@burley.ai?subject=Burley%20Subscription%20Inquiry"
              className="inline-block border border-accent px-6 py-3 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-background transition-all duration-200"
            >
              Or email cam@burley.ai
            </a>
          </div>
        </div>

        <p className="mt-8 text-center font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">
          Most people start with Standard · Avg. response time: same day
        </p>
      </div>
    </section>
  )
}
