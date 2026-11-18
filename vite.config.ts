import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // 相对 base + 关闭 modulepreload：保证 dist/index.html 双击（file://）时零请求报错
  base: "./",
  build: { modulePreload: false },
  plugins: [react(), tailwindcss()],
})
