import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    allowedDevOrigins: [
      '6000-firebase-studio-1773763501576.cluster-nle52mxuvfhlkrzyrq6g2cwb52.cloudworkstations.dev',
      'https://6000-firebase-studio-1773763501576.cluster-nle52mxuvfhlkrzyrq6g2cwb52.cloudworkstations.dev',
      'localhost:9002',
      '0.0.0.0:9002'
    ],
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