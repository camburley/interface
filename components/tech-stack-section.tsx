"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const techLogos = [
  { name: "Next.js", color: "#000000" },
  { name: "Vercel", color: "#000000" },
  { name: "Postgres", color: "#336791" },
  { name: "Firebase", color: "#FFCA28" },
  { name: "Stripe", color: "#635BFF" },
  { name: "LangGraph", color: "#1C3C3C" },
  { name: "OpenAI", color: "#412991" },
]

export function TechStackSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !scrollRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(scrollRef.current, {
        x: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: scrollRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-16 pl-6 md:pl-28 pr-6 md:pr-12 border-y border-border/30">
      <div ref={scrollRef} className="flex items-center gap-12 overflow-x-auto pb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          Tech Stack
        </span>
        {techLogos.map((tech, index) => (
          <div key={index} className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tech.color }} />
            <span className="font-mono text-sm text-foreground/80">{tech.name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
