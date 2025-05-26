import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: './dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    // No proxy needed - Vercel handles API routes automatically
    // Development will use Vercel dev server or direct API calls
  },
});