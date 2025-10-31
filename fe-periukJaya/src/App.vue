<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { ensureCsrfToken } from '@/plugins/axios'
import { useAuthStore } from '@/stores/auth'

// Initialize CSRF token and auth state when app starts
onMounted(async () => {
  const authStore = useAuthStore()
  await ensureCsrfToken()
  
  // Initialize auth state if user was previously logged in
  if (localStorage.getItem('isAuthenticated') === 'true') {
    try {
      await authStore.initializeAuth()
    } catch (error) {
      console.warn('Failed to initialize auth:', error)
      localStorage.removeItem('isAuthenticated')
    }
  }
})
</script>

<template>
  <router-view />
</template>

<style scoped></style>
