"use client"

import { useEffect, useRef } from "react"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { AnimatedNoise } from "@/components/animated-noise"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { SplitFlapText, SplitFlapAudioProvider } from "@/components/split-flap-text"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
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
    <section ref={sectionRef} id="hero" className="relative min-h-screen flex flex-col pl-6 md:pl-28 pr-6 md:pr-12">
      <AnimatedNoise opacity={0.03} />

      <SplitFlapAudioProvider>
        <div className="w-full flex items-center justify-between px-6 md:px-12 py-4 border-b border-border/30">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="h-[36px] w-[90px] md:h-[32px] md:w-[140px] flex items-center shrink-0">
              <div className="scale-[0.22] md:scale-[0.18] origin-left whitespace-nowrap">
                <SplitFlapText text="BURLEY" speed={40} />
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="#mvp-sprint"
                className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                MVP Sprint
              </a>
              <a
                href="#work"
                className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                Work
              </a>
              <a
                href="#process"
                className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                Process
              </a>
              <a
                href="#faq"
                className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQ
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="mailto:cam@burley.ai"
              className="hidden md:block font-mono text-xs text-muted-foreground hover:text-accent transition-colors"
            >
              cam@burley.ai
            </a>
            <a
              href="#apply"
              className="border border-accent px-4 py-2 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-background transition-all duration-200"
            >
              Apply
            </a>
          </div>
        </div>
        {/* </CHANGE> */}
      </SplitFlapAudioProvider>

      <div ref={contentRef} className="flex-1 flex items-center pt-12">
        <div className="w-full">
          <h1 className="font-[var(--font-bebas)] text-[clamp(3rem,10vw,8rem)] leading-[0.9] tracking-tight">
            BUILD AN
            <br />
            INVESTABLE
            <br />
            MVP—FAST.
          </h1>

          <p className="mt-8 max-w-2xl font-mono text-base text-muted-foreground leading-relaxed">
            I&apos;m Cam. I help founders ship a vertical slice of their product in 5 days—deployed, usable, and ready
            to show investors or users. No endless iterations. No agency layers. Just you and me building something
            real.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <a
              href="#apply"
              className="group inline-flex items-center gap-3 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
            >
              <ScrambleTextOnHover text="Apply for an MVP Sprint" as="span" duration={0.6} />
              <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
            </a>
            <a
              href="mailto:cam@burley.ai"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Email cam@burley.ai
            </a>
          </div>

          <p className="mt-6 font-mono text-xs text-muted-foreground/60">Work directly with Cam (no agency layers)</p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
            <div className="border border-border/40 p-6">
              <div className="font-mono text-xs uppercase tracking-widest text-accent mb-2">01</div>
              <h3 className="font-[var(--font-bebas)] text-2xl tracking-tight mb-2">Deployed Link</h3>
              <p className="font-mono text-xs text-muted-foreground">Live, working product</p>
            </div>
            <div className="border border-border/40 p-6">
              <div className="font-mono text-xs uppercase tracking-widest text-accent mb-2">02</div>
              <h3 className="font-[var(--font-bebas)] text-2xl tracking-tight mb-2">Loom Walkthrough</h3>
              <p className="font-mono text-xs text-muted-foreground">Demo-ready explanation</p>
            </div>
            <div className="border border-border/40 p-6">
              <div className="font-mono text-xs uppercase tracking-widest text-accent mb-2">03</div>
              <h3 className="font-[var(--font-bebas)] text-2xl tracking-tight mb-2">Next-Step Plan</h3>
              <p className="font-mono text-xs text-muted-foreground">What to build next</p>
            </div>
          </div>
        </div>
      </div>
      {/* </CHANGE> */}

      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12">
        <div className="border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          MVP Sprint / 5 Days
        </div>
      </div>
    </section>
  )
}
