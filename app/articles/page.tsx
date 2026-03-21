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
    <div className="max-w-[736px] mx-auto px-6" style={{ paddingTop: "80px", paddingBottom: "64px" }}>
      <header style={{ marginBottom: "40px" }}>
        {/* Page title: Newsreader, 48px, weight 400 */}
        <h1
          className="font-editorial-serif text-[48px] font-normal leading-normal text-foreground"
          style={{ marginBottom: "12px" }}
        >
          Articles
        </h1>
        <p className="font-editorial-serif text-[24px] font-normal leading-normal text-foreground/40">
          On building products, shipping fast, and the craft of turning ideas
          into software.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="font-editorial-serif text-[20px] font-normal leading-[30px] text-foreground/30">
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
