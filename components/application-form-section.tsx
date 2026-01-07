"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { toast } from "sonner"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface FormData {
  name: string
  email: string
  idea: string
  problem: string
  risk: string
  timeline: string
  budget: string
}

export function ApplicationFormSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    idea: "",
    problem: "",
    risk: "",
    timeline: "",
    budget: "",
  })

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      if (headerRef.current) {
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
      }

      if (formRef.current) {
        gsap.from(formRef.current, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/submit-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application")
      }

      setIsSubmitted(true)
      toast.success("Application submitted!", {
        description: "I'll review your application and get back to you within 24 hours.",
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        idea: "",
        problem: "",
        risk: "",
        timeline: "",
        budget: "",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Failed to submit application", {
        description: error instanceof Error ? error.message : "Please try again or email cam@burley.ai directly.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section ref={sectionRef} id="apply" className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12 bg-accent/5">
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">05 / Apply</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">START YOUR MVP SPRINT</h2>
        <p className="mt-6 max-w-2xl font-mono text-sm text-muted-foreground leading-relaxed">
          Fill out the form below or email me at{" "}
          <a href="mailto:cam@burley.ai" className="text-accent hover:underline">
            cam@burley.ai
          </a>
          . I&apos;ll review your application and get back to you within 24 hours.
        </p>
        <p className="mt-4 font-mono text-xs text-muted-foreground/60">
          Betaworks Camp participant. Dozens of MVPs shipped across AI, fintech, healthcare, and more.
        </p>
      </div>

      {isSubmitted ? (
        <div className="max-w-2xl border border-accent/40 p-8">
          <h3 className="font-[var(--font-bebas)] text-3xl tracking-tight mb-4 text-accent">
            Application Received
          </h3>
          <p className="font-mono text-sm text-muted-foreground leading-relaxed mb-6">
            Thanks for reaching out! I'll review your application and get back to you within 24 hours.
          </p>
          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="font-mono text-xs text-accent hover:underline"
          >
            Submit another application →
          </button>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block font-mono text-xs uppercase tracking-widest text-foreground mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-border/40 bg-background px-4 py-3 font-mono text-sm text-foreground focus:border-accent focus:outline-none transition-colors"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block font-mono text-xs uppercase tracking-widest text-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-border/40 bg-background px-4 py-3 font-mono text-sm text-foreground focus:border-accent focus:outline-none transition-colors"
                placeholder="jane@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="idea" className="block font-mono text-xs uppercase tracking-widest text-foreground mb-2">
              What are you building? (1-2 sentences)
            </label>
            <textarea
              id="idea"
              required
              rows={3}
              value={formData.idea}
              onChange={handleInputChange}
              className="w-full border border-border/40 bg-background px-4 py-3 font-mono text-sm text-foreground focus:border-accent focus:outline-none transition-colors resize-none"
              placeholder="A tool that helps designers find the right color palette..."
            />
          </div>

          <div>
            <label htmlFor="problem" className="block font-mono text-xs uppercase tracking-widest text-foreground mb-2">
              What problem does it solve?
            </label>
            <textarea
              id="problem"
              required
              rows={3}
              value={formData.problem}
              onChange={handleInputChange}
              className="w-full border border-border/40 bg-background px-4 py-3 font-mono text-sm text-foreground focus:border-accent focus:outline-none transition-colors resize-none"
              placeholder="Designers waste hours searching for inspiration..."
            />
          </div>

          <div>
            <label htmlFor="risk" className="block font-mono text-xs uppercase tracking-widest text-foreground mb-2">
              What's your riskiest assumption?
            </label>
            <textarea
              id="risk"
              required
              rows={3}
              value={formData.risk}
              onChange={handleInputChange}
              className="w-full border border-border/40 bg-background px-4 py-3 font-mono text-sm text-foreground focus:border-accent focus:outline-none transition-colors resize-none"
              placeholder="Will designers actually pay for this, or do they prefer free tools?"
            />
          </div>

          <div>
            <label htmlFor="timeline" className="block font-mono text-xs uppercase tracking-widest text-foreground mb-2">
              When do you need this?
            </label>
            <input
              type="text"
              id="timeline"
              required
              value={formData.timeline}
              onChange={handleInputChange}
              className="w-full border border-border/40 bg-background px-4 py-3 font-mono text-sm text-foreground focus:border-accent focus:outline-none transition-colors"
              placeholder="ASAP / Next month / Flexible"
            />
          </div>

          <div>
            <label htmlFor="budget" className="block font-mono text-xs uppercase tracking-widest text-foreground mb-2">
              Budget Range
            </label>
            <input
              type="text"
              id="budget"
              required
              value={formData.budget}
              onChange={handleInputChange}
              className="w-full border border-border/40 bg-background px-4 py-3 font-mono text-sm text-foreground focus:border-accent focus:outline-none transition-colors"
              placeholder="$5k - $50k"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group inline-flex items-center gap-3 border border-accent bg-accent px-6 py-3 font-mono text-xs uppercase tracking-widest text-background hover:bg-accent/90 transition-all duration-200 disabled:opacity-50"
            >
              <ScrambleTextOnHover
                text={isSubmitting ? "Submitting..." : "Submit Application"}
                as="span"
                duration={0.6}
              />
              <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
