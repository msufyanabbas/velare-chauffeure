/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'your-domain.com'],
  },
  // Enable static exports if you want a static site
  // output: 'export',
  
  // Image optimization
  images: {
    domains: ['your-image-domain.com'], // Add your image domains
    // For static export, you might need:
    // unoptimized: true,
  },
  
  // Environment variables (add your production vars)
  env: {
    // Custom environment variables
  },
  
  // Redirects (if needed)
  async redirects() {
    return [
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ]
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig;