"use client"

export function FooterSection() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative py-12 pl-6 md:pl-28 pr-6 md:pr-12 border-t border-border/20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-2">
          <div className="font-[var(--font-bebas)] text-2xl tracking-tight">BURLEY</div>
          <p className="font-mono text-xs text-muted-foreground">
            From thought to thing.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12">
          <nav className="flex flex-col md:flex-row gap-4 md:gap-8">
            <a
              href="#mvp-sprint"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              What You Get
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

          <a
            href="mailto:cam@burley.ai"
            className="font-mono text-xs text-accent hover:underline"
          >
            cam@burley.ai
          </a>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <p className="font-mono text-[10px] text-muted-foreground/60">
          © {currentYear} Burley. All rights reserved.
        </p>
        <p className="font-mono text-[10px] text-muted-foreground/60">
          Built with Next.js • Deployed on Vercel
        </p>
      </div>
    </footer>
  )
}

