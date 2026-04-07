export function PartnersFooter() {
  return (
    <footer className="border-t border-border/30 py-12 px-6 md:px-12 lg:px-28">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <span className="font-[var(--font-bebas)] text-xl tracking-tight">BURLEY</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            burley.ai
          </a>
          <a
            href="/terms"
            className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms
          </a>
          <a
            href="mailto:cam@burley.ai"
            className="font-mono text-xs text-muted-foreground hover:text-accent transition-colors"
          >
            cam@burley.ai
          </a>
          <a
            href="https://x.com/CodeCamCode"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            @CodeCamCode
          </a>
        </div>
      </div>
    </footer>
  )
}
