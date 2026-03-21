import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllArticles, getArticleBySlug, getArticleSlugs } from "@/lib/articles"
import { ArticleHeader } from "@/components/articles/article-header"
import { ArticleBody } from "@/components/articles/article-body"
import { ShareBar } from "@/components/articles/share-bar"
import { ArticleCard } from "@/components/articles/article-card"

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}

  const { frontmatter } = article
  const url = `https://burley.ai/articles/${slug}`

  return {
    title: `${frontmatter.title} — Burley`,
    description: frontmatter.description,
    authors: [{ name: frontmatter.author }],
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      url,
      siteName: "Burley",
      type: "article",
      publishedTime: frontmatter.date,
      authors: [frontmatter.author],
      ...(frontmatter.coverImage && {
        images: [{ url: frontmatter.coverImage, width: 1200, height: 630 }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.description,
      ...(frontmatter.coverImage && { images: [frontmatter.coverImage] }),
    },
    alternates: {
      canonical: url,
    },
  }
}

function ArticleJsonLd({
  article,
  slug,
}: {
  article: NonNullable<ReturnType<typeof getArticleBySlug>>
  slug: string
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.frontmatter.title,
    description: article.frontmatter.description,
    datePublished: article.frontmatter.date,
    author: {
      "@type": "Person",
      name: article.frontmatter.author,
      url: "https://burley.ai",
    },
    publisher: {
      "@type": "Organization",
      name: "Burley",
      url: "https://burley.ai",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://burley.ai/articles/${slug}`,
    },
    ...(article.frontmatter.coverImage && {
      image: article.frontmatter.coverImage,
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article || !article.frontmatter.published) notFound()

  const allArticles = getAllArticles()
  const relatedArticles = allArticles
    .filter((a) => a.slug !== slug)
    .slice(0, 3)

  return (
    <>
      <ArticleJsonLd article={article} slug={slug} />

      <div className="max-w-[720px] mx-auto px-6 pt-16 pb-12">
        <ArticleHeader
          frontmatter={article.frontmatter}
          readingTime={article.readingTime}
        />

        <ArticleBody content={article.content} />

        <div className="mt-12 pt-8 border-t border-border/30 flex items-center justify-between">
          <ShareBar title={article.frontmatter.title} slug={slug} />
          <span className="font-mono text-xs text-muted-foreground">
            {article.readingTime} min read
          </span>
        </div>
      </div>

      {relatedArticles.length > 0 && (
        <section className="border-t border-border/20">
          <div className="max-w-[720px] mx-auto px-6 py-16">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8">
              More articles
            </h2>
            {relatedArticles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

export const dynamic = "force-static"
