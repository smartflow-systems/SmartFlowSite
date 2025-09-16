/** @type {import('next').NextConfig} */
const nextConfig = { async rewrites(){ return [{ source:'/health', destination:'/api/health' }]; } };
export default nextConfig;
