/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    WEEKLY_REPORTS_SECRET: process.env.WEEKLY_REPORTS_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  },
}

export default nextConfig
