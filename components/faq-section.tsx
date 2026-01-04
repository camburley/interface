"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const faqs = [
  {
    question: "What if my idea is too complex for 5 days?",
    answer:
      "That's the point. We scope it down to a vertical slice—one core flow that proves your riskiest assumption. Not the whole product. Just enough to learn if it's worth building more.",
  },
  {
    question: "Why should I work with you instead of a dev agency or full-time hire?",
    answer:
      "Because I specialize in the earliest, fuzziest stage—when you don't know exactly what to build yet. Agencies want a spec. Full-time hires need onboarding. I help you figure out the spec BY building. Every serious founder I've worked with has asked me to stay involved beyond the initial build—as a technical lead, partner, or advisor. That's because I don't just execute; I help shape the product.",
  },
  {
    question: "Do I get to keep the code?",
    answer:
      "Yes. You get full access to the GitHub repo, and you own everything. No licensing fees. No vendor lock-in. You can take it and run with it, or hire someone else to continue building.",
  },
  {
    question: "What if I need changes after the 5 days?",
    answer:
      "I offer a 7-day support window after delivery for bug fixes and small tweaks. Bigger changes or new features would be a separate engagement. Most clients don't need this—the MVP is usually solid.",
  },
  {
    question: "Can I pay for a faster turnaround?",
    answer:
      "No. 5 days is already fast. Rushing it would compromise quality. If you need something urgently, I recommend starting with an even smaller scope—there's always a smaller version that proves the key risk.",
  },
  {
    question: "Do you work with non-technical founders?",
    answer:
      "Yes. About half my clients are non-technical. You don't need to know how to code. You just need to know what problem you're solving and who has it. I'll handle the technical decisions and explain everything in the Loom.",
  },
]

export function FaqSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(0)

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
    <section ref={sectionRef} id="faq" className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12">
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">04 / Questions</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">FREQUENTLY ASKED</h2>
      </div>

      <div className="max-w-3xl space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-border/40 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-accent/5 transition-colors"
            >
              <h3 className="font-[var(--font-bebas)] text-xl md:text-2xl tracking-tight pr-4">{faq.question}</h3>
              <div
                className={cn(
                  "flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-300",
                  openIndex === index && "rotate-180",
                )}
              >
                <div className="w-4 h-4 relative">
                  <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-accent -translate-y-1/2" />
                  <div
                    className={cn(
                      "absolute left-1/2 top-0 bottom-0 w-[2px] bg-accent -translate-x-1/2 transition-transform duration-300",
                      openIndex === index && "scale-y-0",
                    )}
                  />
                </div>
              </div>
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                openIndex === index ? "max-h-96" : "max-h-0",
              )}
            >
              <div className="px-6 pb-6">
                <p className="font-mono text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
