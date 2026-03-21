import { ArticleFrontmatter } from "@/lib/articles"

const DEFAULT_BIO =
  "Cam builds MVPs for founders in 5-day sprints. He writes about product strategy, technical architecture, and turning ideas into shipped software."

interface AuthorSidebarProps {
  frontmatter: ArticleFrontmatter
}

export function AuthorSidebar({ frontmatter }: AuthorSidebarProps) {
  const initials = frontmatter.author
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <aside className="hidden lg:block w-[180px] shrink-0 pt-1">
      <div className="w-[48px] h-[48px] rounded-full bg-[oklch(0.18_0_0)] border border-foreground/10 flex items-center justify-center mb-3">
        <span className="font-editorial-sans text-[13px] text-foreground/60 font-medium">
          {initials}
        </span>
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
