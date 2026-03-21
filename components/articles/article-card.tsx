import Link from "next/link"
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
      <article className="py-8 border-b border-border/20 transition-colors">
        {frontmatter.tags && frontmatter.tags.length > 0 && (
          <div className="flex items-center gap-3 mb-3">
            {frontmatter.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] uppercase tracking-widest text-accent/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h2 className="font-sans text-xl md:text-2xl font-bold text-foreground group-hover:text-accent transition-colors tracking-tight mb-2">
          {frontmatter.title}
        </h2>

        <p className="text-[15px] leading-relaxed text-muted-foreground mb-4 line-clamp-2">
          {frontmatter.description}
        </p>

        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="font-mono text-[9px] text-accent font-medium">
              CB
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span>{frontmatter.author}</span>
            <span className="text-border">·</span>
            <time dateTime={frontmatter.date}>{formattedDate}</time>
            <span className="text-border">·</span>
            <span>{readingTime} min</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
