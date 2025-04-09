// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000' // Adjust the port to match your backend port
    }
  },
  build: {
    outDir: '../backend/public', // Build output to serve from backend
  }
});
