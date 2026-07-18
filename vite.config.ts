import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Lot-slope/',
  server: {
    proxy: {
      '/api/opentopodata': {
        target: 'https://api.opentopodata.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/opentopodata/, ''),
      },
    },
  },
})
