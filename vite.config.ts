import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function figmaAssetsPlugin() {
  const FIGMA_MAKE_KEY = 'Ot9IoDKZlYYU3v1pFUIw73'
  return {
    name: 'figma-assets',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) return '\0' + id
    },
    load(id: string) {
      if (id.startsWith('\0figma:asset/')) {
        const hash = id.replace('\0figma:asset/', '')
        const url = `https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/${FIGMA_MAKE_KEY}/${hash}`
        return `export default "${url}"`
      }
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    figmaAssetsPlugin(),
  ],
})
