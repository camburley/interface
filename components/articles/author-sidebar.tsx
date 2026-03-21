import Image from "next/image"
import { ArticleFrontmatter } from "@/lib/articles"

const DEFAULT_BIO =
  "Cam builds MVPs for founders in 5-day sprints. He writes about product strategy, technical architecture, and turning ideas into shipped software."

interface AuthorSidebarProps {
  frontmatter: ArticleFrontmatter
}

export function AuthorSidebar({ frontmatter }: AuthorSidebarProps) {
  return (
    <aside className="hidden lg:block w-[180px] shrink-0 pt-1">
      <div className="w-[48px] h-[48px] rounded-full overflow-hidden mb-3 border border-foreground/10">
        <Image
          src="/images/cam-burley.png"
          alt={frontmatter.author}
          width={48}
          height={48}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="mb-2">
        <p className="font-editorial-sans text-[11px] font-medium uppercase tracking-[0.08em] text-foreground/50 leading-[16px]">
          BY {frontmatter.author.toUpperCase()}
        </p>
        {frontmatter.tags && frontmatter.tags.length > 0 && (
          <p className="font-editorial-sans text-[11px] font-medium uppercase tracking-[0.08em] text-foreground/30 leading-[16px]">
            {frontmatter.tags[0]}
          </p>
        )}
      </div>

      <p className="font-editorial-sans text-[13px] font-normal leading-[19px] text-foreground/40">
        {frontmatter.authorBio || DEFAULT_BIO}
      </p>
    </aside>
  )
}
