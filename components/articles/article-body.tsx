"use client"

import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"

const components = {
  h2: (props: React.ComponentProps<"h2">) => (
    <h2
      className="font-[var(--font-serif)] text-2xl font-normal text-foreground mt-14 mb-4 leading-[1.5]"
      {...props}
    />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3
      className="font-[var(--font-serif)] text-xl font-semibold text-foreground mt-10 mb-3 leading-[1.5]"
      {...props}
    />
  ),
  h4: (props: React.ComponentProps<"h4">) => (
    <h4
      className="font-[var(--font-serif)] text-lg font-semibold text-foreground mt-8 mb-2 leading-[1.5]"
      {...props}
    />
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p
      className="font-[var(--font-serif)] text-[1.25rem] leading-[1.5] text-foreground/90 mb-7"
      {...props}
    />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul className="mb-7 space-y-1.5" {...props} />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol className="mb-7 space-y-1.5 list-decimal pl-6" {...props} />
  ),
  li: (props: React.ComponentProps<"li">) => (
    <li
      className="font-[var(--font-serif)] text-[1.25rem] leading-[1.5] text-foreground/90 pl-2"
      {...props}
    />
  ),
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote
      className="border-l-[3px] border-foreground/20 pl-6 my-10 [&>p]:italic [&>p]:text-foreground/70"
      {...props}
    />
  ),
  strong: (props: React.ComponentProps<"strong">) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  em: (props: React.ComponentProps<"em">) => (
    <em className="italic" {...props} />
  ),
  a: (props: React.ComponentProps<"a">) => (
    <a
      className="text-foreground underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground/60 transition-colors"
      {...props}
    />
  ),
  hr: () => <hr className="my-[50px] border-0 border-t border-foreground/10" />,
  code: (props: React.ComponentProps<"code">) => (
    <code
      className="font-mono text-[0.85em] bg-[oklch(0.15_0_0)] px-1.5 py-0.5 text-foreground/80"
      {...props}
    />
  ),
  pre: (props: React.ComponentProps<"pre">) => (
    <pre
      className="font-mono text-sm bg-[oklch(0.12_0_0)] border border-[oklch(0.2_0_0)] p-5 mb-7 overflow-x-auto leading-relaxed"
      {...props}
    />
  ),
}

interface ArticleBodyProps {
  content: string
}

export function ArticleBody({ content }: ArticleBodyProps) {
  return (
    <div className="mt-10">
      <MDXRemote
        source={content}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug],
          },
        }}
      />
    </div>
  )
}
