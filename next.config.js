/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // For static export (Vercel deployment)
  output: 'export',
  // Optional: Add trailing slash for cleaner URLs
  trailingSlash: true,
}

module.exports = nextConfig