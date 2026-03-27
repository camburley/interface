"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function PartnersAbout() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.from(ref.current!.querySelector(".about-content"), {
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
    <section ref={ref} className="relative py-24 px-6 md:px-12 lg:px-28 border-y border-border/30">
      <div className="about-content max-w-3xl mx-auto text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent mb-6">About</p>
        <p className="font-[var(--font-editorial-serif)] text-2xl md:text-3xl leading-relaxed text-foreground/90 italic">
          Burley is run entirely by Cam—one developer, augmented by AI. No outsourcing. No extra hires. Just senior-quality engineering delivered at a speed no agency can match.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-8">
          <div className="text-center">
            <span className="font-[var(--font-bebas)] text-4xl text-accent">14+</span>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Products shipped</p>
          </div>
          <div className="hidden sm:block w-px h-10 bg-border/40" />
          <div className="text-center">
            <span className="font-[var(--font-bebas)] text-4xl text-accent">48hr</span>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Avg. delivery</p>
          </div>
          <div className="hidden sm:block w-px h-10 bg-border/40" />
          <div className="text-center">
            <span className="font-[var(--font-bebas)] text-4xl text-accent">AI</span>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Powered delivery</p>
          </div>
        </div>
      </div>
    </section>
  )
}
