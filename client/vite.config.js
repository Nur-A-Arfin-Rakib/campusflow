import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    // In development: proxy /api → localhost:5000 (no CORS issues)
    // In production: /api goes to the same origin (Render static + API on same domain)
    //                OR use VITE_API_URL env var for cross-origin (Railway)
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    define: {
      // Expose API URL to the app so axios can use it in production
      __API_URL__: JSON.stringify(env.VITE_API_URL || ''),
    },
  }
})
