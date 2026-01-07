"use client"

const benefits = [
  {
    number: "01",
    title: "A deployed, working link",
    description: "Not a prototype. Not a mockup. A real product you can share with investors, users, or teammates.",
  },
  {
    number: "02",
    title: "Loom walkthrough video",
    description: "I explain what I built, why, and how to use it. Perfect for pitching or onboarding your team.",
  },
  {
    number: "03",
    title: "Next-step plan",
    description: "A prioritized roadmap of what to build next, based on what we learned during the sprint.",
  },
  {
    number: "04",
    title: "Full source code",
    description: "Clean, commented code in a GitHub repo. You own everything. No vendor lock-in.",
  },
  {
    number: "05",
    title: "Direct access to me",
    description: "No project managers. No account executives. Just you and me on Slack throughout the sprint.",
  },
  {
    number: "06",
    title: "Fast turnaround",
    description: "5 business days from kickoff to delivery. Most sprints finish on schedule.",
  },
]

export function MvpBenefitsSection() {
  return (
    <section id="mvp-sprint" className="relative py-16 md:py-24 pl-6 md:pl-28 pr-6 md:pr-12">
      <div className="mb-8 md:mb-12">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">01 / What You Get</span>
        <h2 className="mt-3 font-[var(--font-bebas)] text-4xl md:text-6xl tracking-tight">WHAT YOU WALK AWAY WITH</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {benefits.map((benefit) => (
          <article
            key={benefit.number}
            className="group border border-border/40 p-5 hover:border-accent/60 transition-all duration-300"
          >
            <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">{benefit.number}</div>
            <h3 className="font-[var(--font-bebas)] text-xl tracking-tight mb-2 group-hover:text-accent transition-colors leading-tight">
              {benefit.title}
            </h3>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed">{benefit.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
