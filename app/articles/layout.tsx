import Link from "next/link"

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/20">
        <div className="max-w-[720px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-[var(--font-bebas)] text-xl tracking-tight text-foreground hover:text-accent transition-colors"
          >
            BURLEY
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/articles"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Articles
            </Link>
            <Link
              href="/#apply"
              className="font-mono text-xs uppercase tracking-widest text-accent hover:text-foreground transition-colors"
            >
              Work with me
            </Link>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="border-t border-border/20 mt-20">
        <div className="max-w-[720px] mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="font-[var(--font-bebas)] text-xl tracking-tight mb-1">
                BURLEY
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                From thought to thing.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="/articles"
                className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Articles
              </Link>
              <a
                href="mailto:cam@burley.ai"
                className="font-mono text-xs text-accent hover:underline"
              >
                cam@burley.ai
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/10">
            <p className="font-mono text-[10px] text-muted-foreground/60">
              © {new Date().getFullYear()} Burley. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
