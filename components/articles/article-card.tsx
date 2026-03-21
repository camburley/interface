import Link from "next/link"
import Image from "next/image"
import { Article } from "@/lib/articles"
import { format } from "date-fns"

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { frontmatter, slug } = article
  const formattedDate = format(new Date(frontmatter.date), "MMM d, yyyy")

  return (
    <Link href={`/articles/${slug}`} className="group block">
      <article className="flex" style={{ gap: "20px", padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Thumbnail */}
        {frontmatter.coverImage && (
          <div className="hidden sm:block shrink-0 relative overflow-hidden" style={{ width: "160px", height: "100px" }}>
            <Image
              src={frontmatter.coverImage}
              alt={frontmatter.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Card title: Switzer, 18px, weight 500 */}
          <h2 className="font-editorial-sans text-[18px] font-medium leading-[27px] text-foreground group-hover:text-foreground/70 transition-colors mb-1">
            {frontmatter.title}
          </h2>

          {/* Card desc */}
          <p className="font-editorial-serif text-[15px] font-normal leading-[22px] text-foreground/50 line-clamp-2 mb-2">
            {frontmatter.description}
          </p>

          {/* Author + date row */}
          <div className="flex items-center" style={{ gap: "8px" }}>
            <div className="flex items-center" style={{ gap: "6px" }}>
              <div className="w-[20px] h-[20px] rounded-full bg-foreground/10 flex items-center justify-center">
                <span className="font-editorial-sans text-[7px] text-foreground/40 font-medium">
                  CB
                </span>
              </div>
              <span className="font-editorial-sans text-[13px] text-foreground/40">
                {frontmatter.author}
              </span>
            </div>
            <span className="font-editorial-sans text-[13px] text-foreground/25">
              {formattedDate}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
