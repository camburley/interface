import Link from "next/link"

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav: Switzer, 15px, weight 400 — matches every.to nav structure */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-foreground/5">
        <div className="max-w-[1248px] mx-auto px-6 flex items-center justify-between" style={{ height: "56px" }}>
          <Link
            href="/"
            className="font-[var(--font-bebas)] text-[22px] tracking-tight text-foreground"
          >
            BURLEY
          </Link>
          <div className="flex items-center" style={{ gap: "24px" }}>
            <Link
              href="/articles"
              className="font-editorial-sans text-[15px] font-normal text-foreground/60 hover:text-foreground transition-colors"
            >
              Articles
            </Link>
            <Link
              href="/#apply"
              className="font-editorial-sans text-[15px] font-normal text-foreground/60 hover:text-foreground transition-colors"
            >
              Work with me
            </Link>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      {/* Footer — matches every.to footer tone */}
      <footer className="border-t border-foreground/5">
        <div className="max-w-[736px] mx-auto px-6" style={{ padding: "64px 24px" }}>
          <div className="flex flex-col items-center text-center" style={{ gap: "12px" }}>
            <div className="font-[var(--font-bebas)] text-[22px] tracking-tight text-foreground">
              BURLEY
            </div>
            <p className="font-editorial-serif text-[18px] font-normal text-foreground/40">
              New ideas on building products — in your inbox.
            </p>
            <a
              href="mailto:cam@burley.ai"
              className="font-editorial-sans text-[14px] text-foreground/30 hover:text-foreground/60 transition-colors"
            >
              cam@burley.ai
            </a>
          </div>
          <div className="mt-10 pt-6 border-t border-foreground/5 flex justify-between items-center">
            <p className="font-editorial-sans text-[12px] text-foreground/20">
              © {new Date().getFullYear()} Burley. All rights reserved.
            </p>
            <div className="flex items-center" style={{ gap: "20px" }}>
              <Link
                href="/"
                className="font-editorial-sans text-[12px] text-foreground/20 hover:text-foreground/40 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/articles"
                className="font-editorial-sans text-[12px] text-foreground/20 hover:text-foreground/40 transition-colors"
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
