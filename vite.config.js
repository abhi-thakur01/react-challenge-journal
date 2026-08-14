import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://abhi-thakur01.github.io/react-challenge-journal/
// Local dev: base stays '/' when not building for pages
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/react-challenge-journal/' : '/',
})
