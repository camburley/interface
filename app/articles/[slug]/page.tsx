import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import {
  getAllArticles,
  getArticleBySlug,
  getArticleSlugs,
} from "@/lib/articles"
import { ArticleHeader } from "@/components/articles/article-header"
import { ArticleBody } from "@/components/articles/article-body"
import { ArticleCard } from "@/components/articles/article-card"
import { AuthorSidebar } from "@/components/articles/author-sidebar"

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
  const relatedArticles = allArticles.filter((a) => a.slug !== slug).slice(0, 3)

  return (
    <>
      <ArticleJsonLd article={article} slug={slug} />

      {article.frontmatter.coverImage && (
        <figure className="mx-auto" style={{ maxWidth: "1248px", margin: "80px auto 0" }}>
          <div className="relative w-full aspect-[16/9] overflow-hidden px-6">
            <Image
              src={article.frontmatter.coverImage}
              alt={article.frontmatter.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="max-w-[736px] mx-auto px-6">
            <p className="text-[12px] text-foreground/30 mt-2">
              Illustration
            </p>
          </div>
        </figure>
      )}

      {/* Two-column layout: author sidebar + main content */}
      <div
        className="mx-auto px-6"
        style={{
          maxWidth: "980px",
          paddingTop: article.frontmatter.coverImage ? "40px" : "80px",
          paddingBottom: "64px",
        }}
      >
        <div className="flex gap-10">
          <AuthorSidebar frontmatter={article.frontmatter} />

          <article className="min-w-0 flex-1 max-w-[736px]">
            <ArticleHeader
              frontmatter={article.frontmatter}
              readingTime={article.readingTime}
              slug={slug}
            />
            <ArticleBody content={article.content} />
          </article>
        </div>
      </div>

      {relatedArticles.length > 0 && (
        <section className="border-t border-foreground/5">
          <div
            className="max-w-[736px] mx-auto px-6"
            style={{ padding: "16px 24px 64px" }}
          >
            <h2
              className="font-editorial-sans text-[18px] font-medium leading-[27px] text-foreground"
              style={{ marginBottom: "16px" }}
            >
              Related
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
