/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
    return [{ source: '/api/:path*', destination: `${api}/:path*` }];
  },
};

export default nextConfig;
