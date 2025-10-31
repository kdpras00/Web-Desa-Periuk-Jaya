import { axiosInstance } from '@/plugins/axios'
import router from '@/router'

import { defineStore } from 'pinia'

import { handleError } from '@/helpers/errorHelper'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
    success: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        // Request CSRF cookie from Sanctum before login
        // The CSRF endpoint is at the root path, not under /api
        const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
        const csrfBaseURL = baseURL.endsWith('/api') ? baseURL.slice(0, -4) : baseURL
        const csrfAxios = axios.create({
          baseURL: csrfBaseURL,
          withCredentials: true,
          xsrfCookieName: 'XSRF-TOKEN',
          xsrfHeaderName: 'X-XSRF-TOKEN'
        })
        await csrfAxios.get('/sanctum/csrf-cookie')
        
        // Small delay to ensure CSRF cookie is set
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Using the base axios instance for login
        const response = await axiosInstance.post('/login', credentials)
        
        // Set user data from login response
        this.user = response.data.data
        this.success = 'Login berhasil'
        
        // Set flag in localStorage to indicate user is authenticated
        localStorage.setItem('isAuthenticated', 'true')
        
        // After login, session is regenerated, so we need to get new CSRF cookie
        // This ensures subsequent requests have the correct session ID
        await csrfAxios.get('/sanctum/csrf-cookie')
        
        // Delay to ensure new session cookie is fully active
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Don't navigate here - let the Login.vue component handle it with SweetAlert
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      try {
        await axiosInstance.post('/logout')
        // With Sanctum, the cookie is removed automatically by the backend
        this.user = null
        // Clear authentication flag from localStorage
        localStorage.removeItem('isAuthenticated')
        router.push({ name: 'login' })
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async checkAuth() {
      // With Sanctum, we don't need to check for a token in the store
      // The authentication is handled via cookies
      try {
        const response = await axiosInstance.get('/me')
        this.user = response.data.data
        // Ensure localStorage flag is set when auth check succeeds
        localStorage.setItem('isAuthenticated', 'true')
        return this.user
      } catch (error) {
        // If there's an authentication error, clear the user data
        this.user = null
        // Clear localStorage flag when auth check fails
        localStorage.removeItem('isAuthenticated')
        if (error.response?.status === 401) {
          // Don't automatically logout here to avoid redirect loops
          // The router guard will handle the redirect
          // Return null to indicate user is not authenticated
          return null
        }
        // For other errors, re-throw them
        throw error
      }
    },
    
    // New method to initialize auth state on app startup
    async initializeAuth() {
      try {
        // Only check auth if localStorage indicates user was previously authenticated
        // This prevents unnecessary 401 errors on fresh page loads
        const wasAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
        
        if (wasAuthenticated) {
          // Request CSRF cookie from Sanctum
          // The CSRF endpoint is at the root path, not under /api
          const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
          const csrfBaseURL = baseURL.endsWith('/api') ? baseURL.slice(0, -4) : baseURL
          const csrfAxios = axios.create({
            baseURL: csrfBaseURL,
            withCredentials: true,
            xsrfCookieName: 'XSRF-TOKEN',
            xsrfHeaderName: 'X-XSRF-TOKEN'
          })
          await csrfAxios.get('/sanctum/csrf-cookie')
          
          // Small delay to ensure CSRF cookie is set
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Check auth on app startup to handle page refreshes
          // If this fails (401), checkAuth will clear the localStorage flag
          await this.checkAuth()
        } else {
          // No authentication flag found, user is not authenticated
          this.user = null
        }
      } catch (error) {
        // If we can't verify auth, that's fine - the router guard will handle it
        this.user = null
        localStorage.removeItem('isAuthenticated')
      }
    }
  },
})