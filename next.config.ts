import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Optimized for Next.js 15 stability
  },
  images: {
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
};

export default nextConfig;