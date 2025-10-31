import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Mount the app immediately
// Authentication will be checked by router guards when needed
app.mount('#app')