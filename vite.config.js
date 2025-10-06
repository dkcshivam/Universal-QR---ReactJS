import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Load environment variables from `.env`, `.env.local`, etc.
  const env = loadEnv(mode, process.cwd(), '')

  // Safe handling of allowed hosts
  const allowedHosts = env.VITE_ALLOWED_HOSTS
    ? env.VITE_ALLOWED_HOSTS.split(',')
    : 'testing-universal-qr.ai.dkcexportstna.in,vishal.local,universal-qr.ai.dkcexportstna.in' // fallback to allow all if not set

  // Log allowed hosts to verify
  console.log('Vite allowed hosts:', allowedHosts)

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    server: {
      port: env.VITE_PORT ? parseInt(env.VITE_PORT, 10) : 3002,
      allowedHosts
    }
  }
})
