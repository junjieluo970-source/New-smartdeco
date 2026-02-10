import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Prevent "ReferenceError: process is not defined" for libraries expecting Node env
    'process.env': {},
    // Safely inject the API key. 
    // IMPORTANT: Make sure 'API_KEY' is set in your Vercel Project Settings > Environment Variables
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
});