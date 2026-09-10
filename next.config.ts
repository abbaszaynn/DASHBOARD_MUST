import type {NextConfig} from 'next';

const backendOrigin =
  process.env.BACKEND_API_URL || 'http://127.0.0.1:7860';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // The /api/py rewrite proxy aborts after 30s by default. A live Apify scrape
    // (up to ~5 min) and the backend's first model-loading request both run past
    // that, and surface as a 500 even though the backend finishes the work.
    proxyTimeout: 300_000,
  },
  async rewrites() {
    return [
      {
        source: '/api/py/:path*',
        destination: `${backendOrigin}/:path*`,
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
