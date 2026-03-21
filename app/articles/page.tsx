import type { Metadata } from "next"
import { getAllArticles } from "@/lib/articles"
import { ArticleCard } from "@/components/articles/article-card"

export const metadata: Metadata = {
  title: "Articles — Burley",
  description:
    "Thoughts on building MVPs, product strategy, and shipping software that matters. By Cam Burley.",
  openGraph: {
    title: "Articles — Burley",
    description:
      "Thoughts on building MVPs, product strategy, and shipping software that matters.",
    url: "https://burley.ai/articles",
    siteName: "Burley",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles — Burley",
    description:
      "Thoughts on building MVPs, product strategy, and shipping software that matters.",
  },
  alternates: {
    canonical: "https://burley.ai/articles",
  },
}

export default function ArticlesPage() {
  const articles = getAllArticles()

  return (
    <div className="max-w-[736px] mx-auto px-6 py-20">
      <header className="mb-14">
        <h1 className="font-[var(--font-serif)] text-[2.5rem] md:text-[3rem] font-normal text-foreground tracking-[-0.01em] mb-4">
          Articles
        </h1>
        <p className="font-[var(--font-serif)] text-xl text-foreground/50 leading-relaxed">
          On building products, shipping fast, and the craft of turning ideas
          into software.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="font-[var(--font-serif)] text-lg text-foreground/40">
          New writing coming soon.
        </p>
      ) : (
        <div>
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}

export const dynamic = "force-static"
