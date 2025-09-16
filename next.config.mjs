/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites(){ return [{ source:'/health', destination:'/api/health' }]; },
  experimental: {
    // quiets the .replit.dev preview warning
    allowedDevOrigins: ['.replit.dev'],
  },
};
export default nextConfig;
