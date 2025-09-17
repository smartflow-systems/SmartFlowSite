// [vite.config.js]
import { defineConfig } from 'vite'
const dev = process.env.NODE_ENV !== 'production'
export default defineConfig({
  server: { allowedHosts: dev ? true : ['your-prod-domain.com'] }
})
