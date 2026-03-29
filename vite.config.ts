import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import stylex from '@stylexjs/unplugin/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import VueMacros from 'vue-macros/vite'
import VueRouter from 'vue-router/vite'
// import { analyzer } from 'vite-bundle-analyzer'

const jtsRegex = /\.[jt]s$/

function normalizeImportPath(importPath: string) {
  // slice(2) to remove "#/"
  if (jtsRegex.test(importPath)) {
    return importPath.slice(2, -3)
  }
  return importPath.slice(2)
}

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
    stylex({
      useCSSLayers: true,
      unstable_moduleResolution: {
        type: 'custom',
        filePathResolver: (importPath, sourceFilePath) => {
          if (importPath.startsWith('#/')) {
            const specifier = resolve(import.meta.dirname, './src', normalizeImportPath(importPath))
            return `${fileURLToPath(import.meta.resolve(specifier, pathToFileURL(sourceFilePath)))}.ts`
          }
          if (importPath.startsWith('.')) {
            const resolvedPath = `${resolve(dirname(sourceFilePath), normalizeImportPath(importPath))}.ts`
            return resolvedPath
          }
        },
        getCanonicalFilePath: (filePath) => {
          return filePath
        },
      },
    }),
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
