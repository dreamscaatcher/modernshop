/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  },
  // Configure static generation
  staticPageGenerationTimeout: 120,
  // Completely disable static page generation for API routes and pages that require DB access
  unstable_excludeFiles: [
    '**/node_modules/**',
    '**/app/api/**',
    '**/app/admin/**',
    '**/app/shop/**',
    '**/app/checkout/**'
  ]
}

module.exports = nextConfig
