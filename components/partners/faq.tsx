"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const faqs = [
  {
    question: "How fast will I receive my builds?",
    answer:
      "On average, most requests are completed within 48 hours. More complex features may take longer, but you'll always have visibility into progress on your dashboard.",
  },
  {
    question: "Who does the work?",
    answer:
      "Me—Cam. I don't outsource or hire subcontractors. Every line of code is written or reviewed by me personally. AI handles ~80% of the delivery; I review 100% of it.",
  },
  {
    question: "How does the AI-powered part work?",
    answer:
      "I use AI coding tools (Cursor, Claude, OpenAI) to accelerate development. This means you get senior-quality output at a speed that would normally require a full team. The AI does the heavy lifting; I do the thinking, architecture, and quality control.",
  },
  {
    question: "Is there a limit to how many requests I can make?",
    answer:
      "No. You can add as many requests to your board as you'd like. They'll be worked on based on your plan's active slots—one at a time for Standard, two at a time for Pro.",
  },
  {
    question: "How does the pause feature work?",
    answer:
      "Billing cycles are 31 days. If you pause on day 15, you'll have 16 days remaining. When you unpause, those 16 days pick up where they left off. Simple.",
  },
  {
    question: "What tech stack do you use?",
    answer:
      "Primarily Next.js, React, TypeScript, Vercel, Postgres, Firebase, and Stripe. But I'm flexible—if your project needs Python, React Native, or something else, I'll make it work.",
  },
  {
    question: "What if I need a full MVP first?",
    answer:
      "Perfect. Your first request can be an MVP sprint—a complete vertical slice of your product in about a week. Then transition to ongoing feature development. Many subscribers start this way.",
  },
  {
    question: "How do I submit requests?",
    answer:
      "Through your personal dashboard on burley.ai. Add tasks, set priorities, and track progress in real-time. You also get direct Slack access for quick questions.",
  },
  {
    question: "What if I don't like the result?",
    answer:
      "Unlimited revisions on active requests. I'll iterate until you're satisfied. Plus, you get a Loom walkthrough with every delivery so nothing gets lost in translation.",
  },
  {
    question: "Can I use this for just one month?",
    answer:
      "Absolutely. No minimum commitment. Subscribe for a month, get your work done, and cancel if it's not for you. Most subscribers stay because the value compounds over time.",
  },
]

export function PartnersFaq() {
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
    <section ref={sectionRef} id="faq" className="relative py-32 px-6 md:px-12 lg:px-28">
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">05 / Questions</span>
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
