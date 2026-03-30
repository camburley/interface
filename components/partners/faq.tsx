"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const faqs = [
  {
    question: "Is this unlimited development?",
    answer:
      "It is an unlimited queue, not unlimited simultaneous work. You can add as many items as you want, but work moves through the queue according to your lane.",
  },
  {
    question: "What counts as a task?",
    answer:
      "A task should be a standard-sized unit of work with a clear outcome. Larger initiatives are broken into smaller tasks and delivered incrementally. Each task should describe one clear outcome with relevant context and acceptance criteria.",
  },
  {
    question: "What does \"48 business hours\" mean?",
    answer:
      "Standard-sized tasks typically move within 48 business hours once active. Some items may require clarification, dependency work, or breakdown into smaller steps before starting.",
  },
  {
    question: "Do we need meetings?",
    answer:
      "No recurring meetings are required. The service is designed to run asynchronously through the board and written updates. Priorities, context, approvals, and delivery stay organized in one place.",
  },
  {
    question: "Can I pause?",
    answer:
      "Yes. Billing cycles are 31 days. If you pause on day 15, you'll have 16 days remaining. When you unpause, those 16 days pick up where they left off.",
  },
  {
    question: "What if I have a bigger project?",
    answer:
      "That's fine. Bigger projects are handled by breaking them into sequential tasks and moving them through the queue. The task builder on this page can show you how your project maps to the queue.",
  },
  {
    question: "What fits well?",
    answer:
      "Feature work, bug fixes, redesigns, internal tools, dashboards, integrations, automation, refactors, admin panels, landing pages, API work, and workflow improvements.",
  },
  {
    question: "What does not fit well?",
    answer:
      "Giant single-scope projects submitted as one task, unclear research-heavy initiatives with no concrete deliverable, work requiring frequent live meetings, and projects needing deep enterprise procurement or compliance process.",
  },
  {
    question: "Who does the work?",
    answer:
      "Cam Burley. No outsourcing, no subcontractors. Every line of code is written or reviewed personally. AI tools accelerate delivery—you get senior-quality output at a speed that would normally require a full team.",
  },
  {
    question: "Why choose this over hiring or an agency?",
    answer:
      "Traditional software projects are frustrating: scope has to be defined up front, pricing is unpredictable, every next idea becomes another quote, meetings eat time, and follow-on work gets delayed by process. This model removes that friction.",
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
