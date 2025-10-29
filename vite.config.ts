import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: true,
    proxy: {
      '/api/acled': {
        target: 'https://acleddata.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/acled/, '/api/acled'),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});