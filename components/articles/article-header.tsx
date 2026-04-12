import Image from "next/image"
import { ArticleFrontmatter } from "@/lib/articles"
import { format } from "date-fns"
import { ShareBar } from "./share-bar"
import { ListenButton } from "./listen-button"

interface ArticleHeaderProps {
  frontmatter: ArticleFrontmatter
  readingTime: number
  slug: string
  articleContent: string
}

export function ArticleHeader({
  frontmatter,
  readingTime,
  slug,
  articleContent,
}: ArticleHeaderProps) {
  const [year, month, day] = frontmatter.date.split("-").map(Number)
  const formattedDate = format(new Date(year, month - 1, day), "MMMM d, yyyy")

  return (
    <header>
      {/* Mobile-only byline (sidebar handles desktop) */}
      <div className="flex items-center gap-3 mb-6 lg:hidden">
        <div className="w-[40px] h-[40px] rounded-full overflow-hidden shrink-0 border border-foreground/10">
          <Image
            src="/images/cam-burley.png"
            alt={frontmatter.author}
            width={40}
            height={40}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-editorial-sans text-[14px] font-medium leading-[21px] text-foreground">
            {frontmatter.author}
          </span>
          {frontmatter.tags && (
            <span className="font-editorial-sans text-[14px] font-normal leading-[21px] text-foreground/50">
              {frontmatter.tags.join(" · ")}
            </span>
          )}
        </div>
      </div>

      <h1
        className="font-editorial-serif text-[48px] font-normal leading-normal text-foreground"
        style={{ margin: "-8px 0 20px" }}
      >
        {frontmatter.title}
      </h1>

      <p className="font-editorial-serif text-[24px] font-normal leading-normal text-foreground/60">
        {frontmatter.description}
      </p>

      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        style={{ padding: "12px 0" }}
      >
        <div className="flex items-center gap-4">
          <time
            dateTime={frontmatter.date}
            className="font-editorial-sans text-[16px] font-normal leading-[24px] text-foreground whitespace-nowrap"
          >
            {formattedDate}
          </time>
          <ListenButton
            articleTitle={frontmatter.title}
            articleContent={articleContent}
            readingTime={readingTime}
            audioUrl={frontmatter.audioUrl}
          />
        </div>

        <ShareBar title={frontmatter.title} slug={slug} />
      </div>
    </header>
  )
}
