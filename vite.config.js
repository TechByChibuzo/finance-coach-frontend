import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Your Spring Boot API
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },

      // NEW: TravelArrow proxy
      '/travelarrow': {
        target: 'https://api.travelarrow.io',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/travelarrow/, ''),
      },
    },
  },
})
