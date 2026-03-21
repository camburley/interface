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
      {/* Byline — above title, matches every.to structure exactly */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-[40px] h-[40px] rounded-full bg-[oklch(0.18_0_0)] flex items-center justify-center shrink-0"
        >
          <span className="font-editorial-sans text-[11px] text-foreground/60 font-medium">
            CB
          </span>
        </div>
        <div className="flex flex-col">
          {/* Author: Switzer, 14px, weight 500 */}
          <span className="font-editorial-sans text-[14px] font-medium leading-[21px] text-foreground">
            {frontmatter.author}
          </span>
          {/* Column/tags: Switzer, 14px, weight 400 */}
          {frontmatter.tags && (
            <span className="font-editorial-sans text-[14px] font-normal leading-[21px] text-foreground/50">
              {frontmatter.tags.join(" · ")}
            </span>
          )}
        </div>
      </div>

      {/* H1: Signifier→Newsreader, 48px, weight 400, line-height normal, margin -8px 0 20px */}
      <h1
        className="font-editorial-serif text-[48px] font-normal leading-normal text-foreground"
        style={{ margin: "-8px 0 20px" }}
      >
        {frontmatter.title}
      </h1>

      {/* Subtitle: Signifier→Newsreader, 24px, weight 400, line-height normal */}
      <p className="font-editorial-serif text-[24px] font-normal leading-normal text-foreground/60">
        {frontmatter.description}
      </p>

      {/* Date + share row: flex, padding 12px 0, space-between */}
      <div
        className="flex items-center justify-between"
        style={{ padding: "12px 0" }}
      >
        {/* Date: Switzer, 16px, weight 400, line-height 24px */}
        <time
          dateTime={frontmatter.date}
          className="font-editorial-sans text-[16px] font-normal leading-[24px] text-foreground"
        >
          {formattedDate}
        </time>

        {/* Share: flex, gap 8px */}
        <ShareBar title={frontmatter.title} slug={slug} />
      </div>
    </header>
  )
}
