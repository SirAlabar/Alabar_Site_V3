import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@pixiCore': resolve(__dirname, './src/core/pixi'),
      '@pages': resolve(__dirname, './src/pages'),
      '@components': resolve(__dirname, './src/components'),
      '@styles': resolve(__dirname, './src/styles')
    }
  },
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  // Add video file support
  assetsInclude: ['**/*.mp4', '**/*.webm', '**/*.ogg', '**/*.mov'],
  // Ensure proper MIME types for video files
  optimizeDeps: {
    exclude: ['*.mp4', '*.webm', '*.ogg', '*.mov']
  }
});