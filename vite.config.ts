import { resolve } from 'node:path'
import { stylex } from '@stylex-extend/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import VueMacros from 'vue-macros/vite'
import VueRouter from 'vue-router/vite'
// import { analyzer } from 'vite-bundle-analyzer'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '#': resolve(import.meta.dirname, './src'),
    },
  },
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
        vueRouter: VueRouter(),
      },
    }),
    stylex(),
    // analyzer({ defaultSizes: 'parsed' }),
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
