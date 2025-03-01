import { stylex } from '@stylex-extend/vite'
import vue from '@vitejs/plugin-vue'
import VueMacros from 'unplugin-vue-macros/vite'
import { defineConfig } from 'vite'
import { analyzer } from 'vite-bundle-analyzer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueMacros({
      defineStyleX: true,
      plugins: {
        vue: vue({
          features: {
            // customElement: true,
            optionsAPI: false,
          },
        }),
      },
    }),
    stylex(),
    analyzer({ defaultSizes: 'parsed' }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    cssMinify: 'lightningcss',
    sourcemap: true,
  },
})
