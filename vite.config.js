import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This tells Vite to ignore the "stream" requirement for the browser
      stream: "stream-browserify",
    },
  },
  optimizeDeps: {
    include: ['xlsx-js-style']
  }
})