import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Burley — Agent Skills",
  description:
    "Free agent skills you can paste into any AI agent. Local models, project sizing, and more.",
}

const skills = [
  {
    slug: "gemma4",
    name: "Run Gemma 4 Locally",
    description:
      "Google's most capable open model. Multimodal. 256K context. Runs on your hardware for free.",
    tags: ["local-ai", "open-source", "google"],
  },
  {
    slug: "qwen35",
    name: "Run Qwen 3.5 Locally",
    description:
      "Near-Opus reasoning on consumer hardware. Open source. No API costs.",
    tags: ["local-ai", "open-source", "alibaba"],
  },
  {
    slug: "/skill/task-builder",
    name: "Task Builder",
    description:
      "Break down any project into standard-sized queue tasks for async delivery.",
    tags: ["project-sizing", "productivity"],
    isExternal: true,
  },
]

export default function SkillsPage() {
  return (
    <main className="relative min-h-screen">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-32">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
          / Agent Skills
        </span>
        <h1 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">
          FREE SKILLS FOR
          <br />
          YOUR AI AGENT
        </h1>
        <p className="mt-4 max-w-xl font-mono text-sm text-muted-foreground leading-relaxed">
          Paste a link into your agent&apos;s chat. Tell it what to do. It
          handles the rest. Works with Claude, Cursor, Copilot, Codex, and most
          coding agents.
        </p>

        <div className="mt-16 space-y-6">
          {skills.map((skill) => (
            <Link
              key={skill.slug}
              href={
                skill.isExternal ? skill.slug : `/skills/${skill.slug}`
              }
              className="block border border-border/40 p-6 hover:border-accent/40 transition-colors duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight">
                    {skill.name}
                  </h2>
                  <p className="mt-2 font-mono text-sm text-muted-foreground leading-relaxed">
                    {skill.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skill.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-border/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="flex-shrink-0 text-accent font-mono text-xs mt-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 border-t border-border/30 pt-8">
          <p className="font-mono text-xs text-muted-foreground leading-relaxed">
            Also available via CLI:{" "}
            <code className="text-accent">
              npx skills add camburley/skills
            </code>
          </p>
          <p className="mt-2 font-mono text-xs text-muted-foreground/60 leading-relaxed">
            Built by{" "}
            <a
              href="https://www.linkedin.com/in/camburley/"
              className="text-accent hover:text-foreground transition-colors"
            >
              Cam Burley
            </a>
            . More skills coming.
          </p>
        </div>
      </div>
    </main>
  )
}
