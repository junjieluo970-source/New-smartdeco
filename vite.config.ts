import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Safely inject the API key, defaulting to empty string if missing to avoid build errors
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
});