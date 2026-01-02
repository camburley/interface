"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function PullQuoteSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const quoteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !quoteRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(quoteRef.current, {
        scale: 0.95,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: quoteRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12">
      <div ref={quoteRef} className="max-w-4xl mx-auto text-center">
        <blockquote className="font-[var(--font-bebas)] text-[clamp(2rem,6vw,5rem)] leading-[1.1] tracking-tight">
          "The first build should prove the hardest risk."
        </blockquote>
        <div className="mt-8 w-16 h-[1px] bg-accent mx-auto" />
      </div>
    </section>
  )
}
