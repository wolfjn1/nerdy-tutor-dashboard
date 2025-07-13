/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  // Suppress specific warnings in development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Suppress the Supabase getSession warning in development
      // This warning is expected in middleware where we can't use getUser()
      const originalWarn = console.warn;
      console.warn = (...args) => {
        if (
          args[0] && 
          typeof args[0] === 'string' && 
          args[0].includes('Using the user object as returned from supabase.auth.getSession()')
        ) {
          return;
        }
        originalWarn.apply(console, args);
      };
    }
    return config;
  },
}

module.exports = nextConfig 