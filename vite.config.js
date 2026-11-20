import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so the same build works at a domain root (Azure
  // Static Web Apps) and under a sub-path (GitHub Pages: /aerotech2030/).
  // The app has no client-side routes, so relative paths are safe.
  base: './',
})
