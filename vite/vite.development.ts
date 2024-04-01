import { defineConfig } from 'vite'
import { baseConfig } from './vite.config'

export default defineConfig({
  ...baseConfig,
  server: {
    open: true,
    port: 3000
  }
})
