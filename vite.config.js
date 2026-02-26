import { defineConfig } from 'vite'
import path from 'path'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        turno: resolve(__dirname, 'html/turno.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'js/src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
