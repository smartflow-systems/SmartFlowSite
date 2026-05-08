/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // If /landing doesn't open, change destination to '/landing/index.html'
    return [{ source: '/', destination: '/landing', permanent: false }];
  },
};
module.exports = nextConfig;