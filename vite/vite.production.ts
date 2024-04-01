import path from 'path'
import { defineConfig } from 'vite'
import { baseConfig } from './vite.config'

export default defineConfig({
  ...baseConfig,
  build: {
    outDir: path.join(__dirname, '../docs')
  }
})
