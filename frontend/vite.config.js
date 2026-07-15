import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    fileParallelism: false,
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    setupFiles: './src/test/setup.js',
  },
});
