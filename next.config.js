/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  
  // Force dynamic rendering for all pages to prevent build-time caching
  experimental: {
    // App directory is enabled by default in Next.js 13+
  },
  
  // Ensure environment variables are available
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Add headers to prevent caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ]
  },
  
  webpack: (config, { isServer }) => {
    // Suppress specific warnings
    config.infrastructureLogging = {
      level: 'error',
    }
    
    // Ignore specific warnings
    config.ignoreWarnings = [
      { module: /node_modules/ },
      { message: /Using the user object as returned from supabase/ },
    ]
    
    return config
  },
}

module.exports = nextConfig 