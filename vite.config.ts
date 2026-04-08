import { resolve } from 'path';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/8-Bit/',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'AdminDashboard.html'),
        game: resolve(__dirname, 'Game.html'),
        loginOverlay: 'src/components/LoginOverlay.tsx'
      }
    }
  }
})