/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites(){ return [{ source:'/health', destination:'/api/health' }]; },
  typescript: {
    ignoreBuildErrors: true,
  },
};
export default nextConfig;
