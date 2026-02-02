/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Remove output: 'export' to enable API routes on Vercel
  // API routes require server-side rendering, not static export
}

module.exports = nextConfig