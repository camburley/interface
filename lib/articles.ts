import fs from "fs"
import path from "path"
import matter from "gray-matter"

const articlesDirectory = path.join(process.cwd(), "content/articles")

export interface ArticleFrontmatter {
  title: string
  description: string
  date: string
  author: string
  authorBio?: string
  coverImage?: string
  tags?: string[]
  published: boolean
}

export interface Article {
  slug: string
  frontmatter: ArticleFrontmatter
  content: string
  readingTime: number
}

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).length
  return Math.max(1, Math.ceil(words / 240))
}

export function getArticleSlugs(): string[] {
  if (!fs.existsSync(articlesDirectory)) return []
  return fs
    .readdirSync(articlesDirectory)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""))
}

export function getArticleBySlug(slug: string): Article | null {
  const fullPath = path.join(articlesDirectory, `${slug}.mdx`)
  if (!fs.existsSync(fullPath)) return null

  const fileContents = fs.readFileSync(fullPath, "utf8")
  const { data, content } = matter(fileContents)

  return {
    slug,
    frontmatter: data as ArticleFrontmatter,
    content,
    readingTime: estimateReadingTime(content),
  }
}

export function getAllArticles(): Article[] {
  const slugs = getArticleSlugs()
  return slugs
    .map(getArticleBySlug)
    .filter((a): a is Article => a !== null && a.frontmatter.published)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    )
}
