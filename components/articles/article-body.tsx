import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"

const serifClass = "font-editorial-serif"

const components = {
  h2: (props: React.ComponentProps<"h2">) => (
    <h2
      className={`${serifClass} text-[30px] font-bold leading-[37.5px] text-foreground`}
      style={{ margin: "30px 0 12px" }}
      {...props}
    />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3
      className={`${serifClass} text-[26px] font-bold leading-[33px] text-foreground`}
      style={{ margin: "28px 0 10px" }}
      {...props}
    />
  ),
  h4: (props: React.ComponentProps<"h4">) => (
    <h4
      className={`${serifClass} text-[24px] font-bold leading-[30px] text-foreground`}
      style={{ margin: "24px 0 9.6px" }}
      {...props}
    />
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p
      className={`${serifClass} text-[20px] font-normal leading-[30px] text-foreground/90`}
      style={{ margin: "0 0 20px" }}
      {...props}
    />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul
      className="list-disc pl-8"
      style={{ margin: "0 0 20px" }}
      {...props}
    />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol
      className="list-decimal pl-8"
      style={{ margin: "0 0 20px" }}
      {...props}
    />
  ),
  li: (props: React.ComponentProps<"li">) => (
    <li
      className={`${serifClass} text-[20px] font-normal leading-[30px] text-foreground/90`}
      style={{ margin: "0 0 6px" }}
      {...props}
    />
  ),
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote
      className="border-l-[3px] border-foreground/20 pl-6"
      style={{ margin: "30px 0" }}
      {...props}
    />
  ),
  strong: (props: React.ComponentProps<"strong">) => (
    <strong className="font-bold text-foreground" {...props} />
  ),
  em: (props: React.ComponentProps<"em">) => (
    <em className="italic" {...props} />
  ),
  a: (props: React.ComponentProps<"a">) => (
    <a
      className={`${serifClass} text-foreground underline`}
      {...props}
    />
  ),
  hr: () => (
    <hr
      className="border-0 h-[2px] bg-foreground/15"
      style={{ margin: "50px 0" }}
    />
  ),
  code: (props: React.ComponentProps<"code">) => (
    <code
      className="font-mono text-[0.85em] bg-foreground/10 px-1.5 py-0.5 text-foreground/80"
      {...props}
    />
  ),
  pre: (props: React.ComponentProps<"pre">) => (
    <pre
      className="font-mono text-sm bg-foreground/5 border border-foreground/10 p-5 overflow-x-auto leading-relaxed"
      style={{ margin: "0 0 20px" }}
      {...props}
    />
  ),
}

interface ArticleBodyProps {
  content: string
}

export function ArticleBody({ content }: ArticleBodyProps) {
  return (
    <div style={{ paddingTop: "10px" }}>
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
