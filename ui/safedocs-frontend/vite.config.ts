import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Allows LAN access
    port: 5173,      // Specify the port
    open: true,      // Optional: Open the browser automatically
  },
})
