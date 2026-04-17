import { Octokit } from "@octokit/rest"
import { getFirebaseAdmin } from "@/lib/firebase-admin"

const CACHE_COLLECTION = "github_pr_cache"
const CACHE_TTL_MS = 1000 * 60 * 60 * 6

export interface ParsedPrUrl {
  owner: string
  repo: string
  prNumber: number
}

export interface PullRequestDetails {
  owner: string
  repo: string
  prNumber: number
  url: string
  title: string
  body: string
  comments: string[]
  reviewComments: string[]
  commitMessages: string[]
  fetchedAt: string
}

interface CachedPullRequestDetails {
  owner: string
  repo: string
  prNumber: number
  url: string
  title: string
  body: string
  comments: string[]
  reviewComments: string[]
  commitMessages: string[]
  fetchedAt: string
}

function getOctokit(): Octokit | null {
  const token = process.env.GITHUB_TOKEN
  if (!token) return null
  return new Octokit({ auth: token })
}

function getCacheDocId(owner: string, repo: string, prNumber: number): string {
  return `${owner}__${repo}__${prNumber}`
}

async function readCache(
  owner: string,
  repo: string,
  prNumber: number,
): Promise<PullRequestDetails | null> {
  const { db } = getFirebaseAdmin()
  const docId = getCacheDocId(owner, repo, prNumber)
  const doc = await db.collection(CACHE_COLLECTION).doc(docId).get()
  if (!doc.exists) return null

  const data = doc.data() as CachedPullRequestDetails | undefined
  if (!data?.fetchedAt) return null

  const fetchedAt = Date.parse(data.fetchedAt)
  if (Number.isNaN(fetchedAt)) return null
  if (Date.now() - fetchedAt > CACHE_TTL_MS) return null

  return {
    owner: data.owner,
    repo: data.repo,
    prNumber: data.prNumber,
    url: data.url,
    title: data.title,
    body: data.body,
    comments: data.comments ?? [],
    reviewComments: data.reviewComments ?? [],
    commitMessages: data.commitMessages ?? [],
    fetchedAt: data.fetchedAt,
  }
}

async function writeCache(details: PullRequestDetails): Promise<void> {
  const { db } = getFirebaseAdmin()
  const docId = getCacheDocId(details.owner, details.repo, details.prNumber)
  await db.collection(CACHE_COLLECTION).doc(docId).set(details, { merge: true })
}

export function parseGitHubPrUrl(url: string): ParsedPrUrl | null {
  const value = url.trim()
  const match = value.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)(?:[/?#].*)?$/i,
  )
  if (!match) return null
  return {
    owner: match[1],
    repo: match[2],
    prNumber: Number.parseInt(match[3], 10),
  }
}

export async function getPRDetails(
  owner: string,
  repo: string,
  prNumber: number,
): Promise<PullRequestDetails | null> {
  const cached = await readCache(owner, repo, prNumber)
  if (cached) return cached

  const octokit = getOctokit()
  if (!octokit) return null

  try {
    const [prRes, issueCommentsRes, reviewCommentsRes, commitsRes] =
      await Promise.all([
        octokit.pulls.get({
          owner,
          repo,
          pull_number: prNumber,
        }),
        octokit.issues.listComments({
          owner,
          repo,
          issue_number: prNumber,
          per_page: 100,
        }),
        octokit.pulls.listReviewComments({
          owner,
          repo,
          pull_number: prNumber,
          per_page: 100,
        }),
        octokit.pulls.listCommits({
          owner,
          repo,
          pull_number: prNumber,
          per_page: 100,
        }),
      ])

    const details: PullRequestDetails = {
      owner,
      repo,
      prNumber,
      url: prRes.data.html_url,
      title: prRes.data.title ?? "",
      body: prRes.data.body ?? "",
      comments: issueCommentsRes.data
        .map((comment) => comment.body ?? "")
        .filter(Boolean),
      reviewComments: reviewCommentsRes.data
        .map((comment) => comment.body ?? "")
        .filter(Boolean),
      commitMessages: commitsRes.data
        .map((commit) => commit.commit.message ?? "")
        .filter(Boolean),
      fetchedAt: new Date().toISOString(),
    }

    await writeCache(details)
    return details
  } catch (error) {
    console.error("[github] failed to fetch PR details", {
      owner,
      repo,
      prNumber,
      error,
    })
    return null
  }
}

export async function getPRDetailsFromUrl(
  prUrl: string,
): Promise<PullRequestDetails | null> {
  const parsed = parseGitHubPrUrl(prUrl)
  if (!parsed) return null
  return getPRDetails(parsed.owner, parsed.repo, parsed.prNumber)
}
