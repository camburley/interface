"use client"

import { useState } from "react"
import Link from "next/link"

interface SkillPageProps {
  name: string
  description: string
  skillFile: string
  rawUrl: string // e.g. /skills/gemma4.md
  githubUrl: string
  agentPrompt: string
}

export function SkillPage({
  name,
  description,
  rawUrl,
  githubUrl,
  agentPrompt,
}: SkillPageProps) {
  const [copied, setCopied] = useState<"url" | "prompt" | null>(null)
  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${rawUrl}`
      : rawUrl

  const copyToClipboard = async (text: string, type: "url" | "prompt") => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <main className="relative min-h-screen">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 py-32">
        <Link
          href="/skills"
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-accent transition-colors"
        >
          ← All Skills
        </Link>

        <h1 className="mt-6 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">
          {name.toUpperCase()}
        </h1>
        <p className="mt-4 max-w-xl font-mono text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* How to use */}
        <div className="mt-16">
          <h2 className="font-[var(--font-bebas)] text-3xl tracking-tight">
            USE IT IN 2 STEPS
          </h2>

          <div className="mt-8 space-y-6">
            {/* Step 1 */}
            <div className="border border-border/40 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 border border-accent flex items-center justify-center font-mono text-xs text-accent">
                  1
                </span>
                <h3 className="font-mono text-sm uppercase tracking-widest">
                  Paste this link into your agent&apos;s chat
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-accent/5 border border-border/40 px-4 py-3 font-mono text-sm text-foreground/80 truncate">
                  {fullUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(fullUrl, "url")}
                  className="flex-shrink-0 border border-border/40 px-4 py-3 font-mono text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
                >
                  {copied === "url" ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="border border-border/40 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 border border-accent flex items-center justify-center font-mono text-xs text-accent">
                  2
                </span>
                <h3 className="font-mono text-sm uppercase tracking-widest">
                  Then say this
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-accent/5 border border-border/40 px-4 py-3 font-mono text-sm text-foreground/80">
                  &ldquo;{agentPrompt}&rdquo;
                </code>
                <button
                  onClick={() => copyToClipboard(agentPrompt, "prompt")}
                  className="flex-shrink-0 border border-border/40 px-4 py-3 font-mono text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
                >
                  {copied === "prompt" ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          <p className="mt-6 font-mono text-xs text-muted-foreground/60">
            Your agent reads the skill, asks a couple questions about your
            setup, and handles the rest. Works with Claude Code, Cursor,
            Copilot, Codex, and most coding agents.
          </p>
        </div>

        {/* CLI alternative */}
        <div className="mt-12 border-t border-border/30 pt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 mb-3">
            Power users
          </p>
          <code className="font-mono text-sm text-muted-foreground">
            npx skills add camburley/skills
          </code>
          <span className="ml-4 font-mono text-xs text-muted-foreground/40">
            or{" "}
            <a
              href={githubUrl}
              className="text-muted-foreground/60 hover:text-accent transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              view on GitHub →
            </a>
          </span>
        </div>

        {/* CTA */}
        <div className="mt-16 border border-accent/40 bg-accent/5 p-8 text-center">
          <p className="font-mono text-xs text-muted-foreground/60 uppercase tracking-widest mb-2">
            Need something built?
          </p>
          <h3 className="font-[var(--font-bebas)] text-3xl tracking-tight">
            SOFTWARE DEVELOPMENT, SUBSCRIBED.
          </h3>
          <p className="mt-3 font-mono text-sm text-muted-foreground max-w-md mx-auto">
            Add tasks to your queue. Standard items turn around in 48 hours. One
            monthly price.
          </p>
          <Link
            href="/#pricing"
            className="inline-block mt-6 border border-accent px-6 py-3 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-background transition-all duration-200"
          >
            See Plans
          </Link>
        </div>
      </div>
    </main>
  )
}
