/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!api) throw new Error('NEXT_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local.');
    return [{ source: '/api/:path*', destination: `${api}/:path*` }];
  },
};

export default nextConfig;
