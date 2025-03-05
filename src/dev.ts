import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { handleHotUpdate, routes } from 'vue-router/auto-routes'
import app from './App.vue'
import 'virtual:stylex.css'

const router = createRouter({ history: createWebHistory(), routes })

createApp(app).use(router).mount('#app')

if (import.meta.hot) {
  handleHotUpdate(router)
}

// import 'virtual:uno.css'

// const e = document.createElement('suggestion-box')

// const attr = document.createAttribute('target-url')
// attr.value = 'http://localhost:8787/api/v1/suggestion'
// e.attributes.setNamedItem(attr)

// document.body.appendChild(e)
