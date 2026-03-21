import Link from "next/link"
import Image from "next/image"
import { Article } from "@/lib/articles"
import { format } from "date-fns"

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { frontmatter, slug, readingTime } = article
  const formattedDate = format(new Date(frontmatter.date), "MMM d, yyyy")

  return (
    <Link href={`/articles/${slug}`} className="group block">
      <article className="flex gap-6 py-7 border-b border-[oklch(0.15_0_0)]">
        {/* Thumbnail */}
        {frontmatter.coverImage && (
          <div className="hidden sm:block flex-shrink-0 w-[140px] h-[90px] relative overflow-hidden bg-[oklch(0.12_0_0)]">
            <Image
              src={frontmatter.coverImage}
              alt={frontmatter.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h2 className="font-[var(--font-serif)] text-lg md:text-xl font-normal text-foreground group-hover:text-foreground/70 transition-colors leading-snug mb-1.5">
            {frontmatter.title}
          </h2>

          <p className="text-sm text-foreground/50 leading-relaxed mb-3 line-clamp-2">
            {frontmatter.description}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[oklch(0.18_0_0)] flex items-center justify-center">
                <span className="text-[7px] text-foreground/50 font-mono font-medium">
                  CB
                </span>
              </div>
              <span className="text-xs text-foreground/40">
                {frontmatter.author}
              </span>
            </div>
            <span className="text-xs text-foreground/25">{formattedDate}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
