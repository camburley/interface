import Link from "next/link"

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal top nav — matches every.to's sparse header */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-[oklch(0.15_0_0)]">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-[var(--font-bebas)] text-2xl tracking-tight text-foreground hover:text-foreground/70 transition-colors"
            >
              BURLEY
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/articles"
              className="text-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              Articles
            </Link>
            <Link
              href="/#apply"
              className="text-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              Work with me
            </Link>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      {/* Footer — minimal, matching the editorial tone */}
      <footer className="border-t border-[oklch(0.15_0_0)]">
        <div className="max-w-[736px] mx-auto px-6 py-16">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="font-[var(--font-bebas)] text-2xl tracking-tight">
              BURLEY
            </div>
            <p className="font-[var(--font-serif)] text-lg text-foreground/50">
              New ideas on building products — in your inbox.
            </p>
            <a
              href="mailto:cam@burley.ai"
              className="text-sm text-foreground/40 hover:text-foreground transition-colors"
            >
              cam@burley.ai
            </a>
          </div>
          <div className="mt-10 pt-6 border-t border-[oklch(0.12_0_0)] flex justify-between items-center">
            <p className="text-xs text-foreground/25">
              © {new Date().getFullYear()} Burley. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-xs text-foreground/25 hover:text-foreground/50 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/articles"
                className="text-xs text-foreground/25 hover:text-foreground/50 transition-colors"
              >
                Articles
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
