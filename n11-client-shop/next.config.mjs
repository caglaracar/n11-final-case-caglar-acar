/** @type {import('next').NextConfig} */
// build: 3
const nextConfig = {
  reactStrictMode: false,
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  async redirects() {
    return [
      { source: '/category/:slug', destination: '/products?category=:slug', permanent: true },
    ];
  },
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) throw new Error('NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env.local.');
    return [{ source: '/api/:path*', destination: `${api}/:path*` }];
  },
};

export default nextConfig;
