/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static exports
  basePath: '/Tend', // This will be your repository name
  images: {
    unoptimized: true, // Required for static export
  },
  // Ensure trailing slashes for static hosting
  trailingSlash: true,
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 