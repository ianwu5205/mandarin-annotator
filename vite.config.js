import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: { editor: 'index.html', changes: 'changes.html' },
    },
  },
  plugins: [vue(), tailwindcss()],
})
