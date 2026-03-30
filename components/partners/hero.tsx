"use client"

import { useEffect, useRef } from "react"
import { SplitFlapText, SplitFlapAudioProvider } from "@/components/split-flap-text"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { AnimatedNoise } from "@/components/animated-noise"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function PartnersHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return
    const ctx = gsap.context(() => {
      gsap.to(contentRef.current, {
        y: -100,
        opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="hero" className="relative min-h-screen flex flex-col px-6 md:px-12 lg:px-28">
      <AnimatedNoise opacity={0.03} />

      <SplitFlapAudioProvider>
        {/* Nav */}
        <div className="w-full flex items-center justify-between py-4 border-b border-border/30">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="h-[40px] w-[120px] md:h-[32px] md:w-[140px] flex items-center shrink-0">
              <div className="scale-[0.66] md:scale-[0.18] origin-left whitespace-nowrap">
                <SplitFlapText text="BURLEY" speed={40} />
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#how-it-works" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#pricing" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                Lanes
              </a>
              <a href="#task-builder" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                Size a Project
              </a>
              <a href="#faq" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </a>
              <a href="#book" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                Apply
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="hidden md:block font-mono text-xs text-muted-foreground hover:text-accent transition-colors"
            >
              burley.ai
            </a>
            <a
              href="#task-builder"
              className="border border-accent px-4 py-2 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-background transition-all duration-200"
            >
              Size a Project
            </a>
          </div>
        </div>
      </SplitFlapAudioProvider>

      {/* Hero content */}
      <div ref={contentRef} className="flex-1 flex items-start md:items-center pt-8 md:pt-12">
        <div className="w-full max-w-4xl">
          <div className="mb-4 md:mb-6">
            <span className="inline-block border border-accent/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] md:tracking-[0.3em] text-accent">
              Async · Queue-based · Predictable
            </span>
          </div>

          <h1 className="font-[var(--font-bebas)] text-[clamp(3rem,10vw,8rem)] leading-[0.9] tracking-tight">
            SOFTWARE
            <br />
            DEVELOPMENT,
            <br />
            <span className="text-accent">SUBSCRIBED.</span>
          </h1>

          <p className="mt-8 max-w-xl font-mono text-base text-muted-foreground leading-relaxed">
            Add tasks to your queue. Work moves through the board. Standard-sized items turn around fast. No hourly billing, no constant scoping calls. One monthly price. Predictable delivery.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <a
              href="#task-builder"
              className="group inline-flex items-center gap-3 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
            >
              <ScrambleTextOnHover text="Size Your Project" as="span" duration={0.6} />
              <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
            </a>
            <a
              href="#book"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Book a 15-min intro call →
            </a>
          </div>

          <p className="mt-8 font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
            Currently accepting new lane subscribers
          </p>
        </div>
      </div>
    </section>
  )
}
