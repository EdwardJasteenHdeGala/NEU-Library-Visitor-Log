import type {NextConfig} from 'next';

/**
 * Next.js Configuration for Institutional Deployment on GitHub Pages.
 * Optimized for Static Site Generation (SSG).
 */
const nextConfig: NextConfig = {
  // 1. Enable Static Export for GitHub Pages
  output: 'export',
  
  // 2. Base Path for GitHub Repository: /NEU-Library-Visitor-Log
  // This ensures assets (CSS/JS/Images) load correctly from the subdirectory.
  basePath: '/NEU-Library-Visitor-Log',
  
  // 3. Asset Prefix for GitHub Pages
  assetPrefix: '/NEU-Library-Visitor-Log',

  // 4. Image Optimization Handling for Static Exports
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'neu.edu.ph' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'media.licdn.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }
    ],
  },
  
  // 5. Tracing root removal (handled by SSG)
  experimental: {
    // Next.js 15 stability optimizations
  },
};

export default nextConfig;