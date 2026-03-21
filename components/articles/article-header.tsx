import { ArticleFrontmatter } from "@/lib/articles"
import { format } from "date-fns"
import { ShareBar } from "./share-bar"

interface ArticleHeaderProps {
  frontmatter: ArticleFrontmatter
  readingTime: number
  slug: string
}

export function ArticleHeader({
  frontmatter,
  readingTime,
  slug,
}: ArticleHeaderProps) {
  const formattedDate = format(new Date(frontmatter.date), "MMMM d, yyyy")

  return (
    <header>
      {/* Author byline — sits above the title like every.to */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-[oklch(0.18_0_0)] flex items-center justify-center border border-[oklch(0.25_0_0)]">
          <span className="font-mono text-[11px] text-foreground/70 font-medium">
            CB
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {frontmatter.author}
          </span>
          <span className="text-[13px] text-muted-foreground">
            {frontmatter.tags?.join(" · ")}
          </span>
        </div>
      </div>

      {/* Title — large serif, regular weight */}
      <h1 className="font-[var(--font-serif)] text-[2.5rem] md:text-[3rem] leading-[1.1] font-normal text-foreground tracking-[-0.01em] mb-4">
        {frontmatter.title}
      </h1>

      {/* Subtitle / description — serif, lighter */}
      <p className="font-[var(--font-serif)] text-xl md:text-2xl leading-normal text-foreground/60 mb-8">
        {frontmatter.description}
      </p>

      {/* Date + share row */}
      <div className="flex items-center justify-between pb-8 border-b border-[oklch(0.2_0_0)]">
        <span className="text-[15px] text-foreground/80">{formattedDate}</span>
        <div className="flex items-center gap-1">
          <ShareBar title={frontmatter.title} slug={slug} />
        </div>
      </div>
    </header>
  )
}
