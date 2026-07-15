import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ command }) => {
  // Vercel = "/". VPS (chemin /stic/) = définir VITE_BASE=/stic/ au build.
  const base = process.env.VITE_BASE || '/'

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      ...(command === 'serve' ? [basicSsl()] : []),
    ],
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
        '/storage': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
