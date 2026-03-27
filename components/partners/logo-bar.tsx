"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const clients = [
  "Seekr",
  "AudienceLab",
  "Guideline Buddy",
  "Grain Copilot",
  "Prediction Engine",
  "Supermarket Puzzle",
]

export function PartnersLogoBar() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="border-y border-border/30 py-8 px-6 md:px-12 lg:px-28">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 mb-6 text-center">
        Products built for
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {clients.map((name) => (
          <span
            key={name}
            className="font-mono text-sm uppercase tracking-widest text-muted-foreground/60"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}
