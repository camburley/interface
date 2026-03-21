"use client"

import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"

const components = {
  h2: (props: React.ComponentProps<"h2">) => (
    <h2
      className="font-sans text-2xl font-bold text-foreground mt-12 mb-4 tracking-tight"
      {...props}
    />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3
      className="font-sans text-xl font-semibold text-foreground mt-10 mb-3 tracking-tight"
      {...props}
    />
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p
      className="text-[1.125rem] leading-[1.8] text-foreground/85 mb-6"
      {...props}
    />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul className="mb-6 space-y-2 pl-1" {...props} />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol className="mb-6 space-y-2 pl-1 list-decimal list-inside" {...props} />
  ),
  li: (props: React.ComponentProps<"li">) => (
    <li className="text-[1.125rem] leading-[1.8] text-foreground/85 pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-accent/60 [ol_&]:before:content-none [ol_&]:pl-0" {...props} />
  ),
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote
      className="border-l-2 border-accent/40 pl-6 my-8 italic text-foreground/70"
      {...props}
    />
  ),
  strong: (props: React.ComponentProps<"strong">) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  em: (props: React.ComponentProps<"em">) => (
    <em className="italic text-foreground/90" {...props} />
  ),
  a: (props: React.ComponentProps<"a">) => (
    <a
      className="text-accent underline underline-offset-2 decoration-accent/40 hover:decoration-accent transition-colors"
      {...props}
    />
  ),
  hr: () => (
    <hr className="my-12 border-0 border-t border-border/30" />
  ),
  code: (props: React.ComponentProps<"code">) => (
    <code
      className="font-mono text-[0.9em] bg-secondary/50 px-1.5 py-0.5 rounded-sm text-accent"
      {...props}
    />
  ),
  pre: (props: React.ComponentProps<"pre">) => (
    <pre
      className="font-mono text-sm bg-secondary/30 border border-border/20 p-5 mb-6 overflow-x-auto leading-relaxed"
      {...props}
    />
  ),
}

interface ArticleBodyProps {
  content: string
}

export function ArticleBody({ content }: ArticleBodyProps) {
  return (
    <article className="article-body">
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
    </article>
  )
}
