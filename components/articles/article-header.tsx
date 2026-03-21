import { ArticleFrontmatter } from "@/lib/articles"
import { format } from "date-fns"

interface ArticleHeaderProps {
  frontmatter: ArticleFrontmatter
  readingTime: number
}

export function ArticleHeader({ frontmatter, readingTime }: ArticleHeaderProps) {
  const formattedDate = format(new Date(frontmatter.date), "MMMM d, yyyy")

  return (
    <header className="mb-10">
      {frontmatter.tags && frontmatter.tags.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          {frontmatter.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[11px] uppercase tracking-widest text-accent"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <h1 className="font-sans text-[2.25rem] md:text-[2.75rem] leading-[1.15] font-bold text-foreground tracking-tight mb-5">
        {frontmatter.title}
      </h1>

      <p className="text-lg md:text-xl leading-relaxed text-muted-foreground mb-8">
        {frontmatter.description}
      </p>

      <div className="flex items-center gap-4 pb-8 border-b border-border/30">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
          <span className="font-mono text-sm text-accent font-medium">CB</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {frontmatter.author}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <time dateTime={frontmatter.date}>{formattedDate}</time>
            <span className="text-border">·</span>
            <span>{readingTime} min read</span>
          </div>
        </div>
      </div>
    </header>
  )
}
