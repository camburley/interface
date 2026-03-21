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
    <div className="max-w-[720px] mx-auto px-6 py-16">
      <header className="mb-12">
        <h1 className="font-sans text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
          Articles
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          On building products, shipping fast, and the craft of turning ideas
          into software.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="font-mono text-sm text-muted-foreground">
          New articles coming soon.
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
