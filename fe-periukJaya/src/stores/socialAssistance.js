import { defineStore } from 'pinia'

import { handleError } from '@/helpers/errorHelper'
import { axiosInstance } from './../plugins/axios'
import router from '@/router'

export const useSocialAssistanceStore = defineStore('social-assistance', {
  state: () => ({
    socialAssistances: [],
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
    },
    loading: false,
    error: null,
    success: null,
    abortController: null, // Untuk cancel request sebelumnya
  }),
  actions: {
    async fetchSocialAssistancesPaginated(params) {
      // Cancel request sebelumnya jika masih berjalan
      if (this.abortController) {
        this.abortController.abort()
      }

      // Buat AbortController baru untuk request ini
      this.abortController = new AbortController()

      this.loading = true

      try {
        const response = await axiosInstance.get(`social-assistance/all/paginated`, { 
          params,
          signal: this.abortController.signal 
        })

        this.socialAssistances = response.data.data.data
        this.meta = response.data.data.meta
      } catch (error) {
        // Jangan tampilkan error jika request di-cancel
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          this.error = handleError(error)
        }
      } finally {
        this.loading = false
        this.abortController = null
      }
    },

    async fetchSocialAssistance(id) {
      this.loading = true
      try {
        const response = await axiosInstance.get(`/social-assistance/${id}`)

        return response.data.data
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async createSocialAssistance(payload) {
      this.loading = true
      this.error = null

      try {
        // Convert payload to FormData for file upload
        const formData = new FormData()
        
        // Append all fields to FormData
        Object.keys(payload).forEach(key => {
          // Skip thumbnail_url and id as they're not needed in backend
          if (key !== 'thumbnail_url' && key !== 'id') {
            // Only append if value exists
            if (payload[key] !== null && payload[key] !== undefined && payload[key] !== '') {
              formData.append(key, payload[key])
            }
          }
        })

        const response = await axiosInstance.post('/social-assistance', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.success = response.data.message

        setTimeout(() => {
          this.success = null
        }, 3000)
        router.push({ name: 'social-assistance' })
      } catch (error) {
        this.error = handleError(error)

        setTimeout(() => {
          this.error = null
        }, 5000)
      } finally {
        this.loading = false
      }
    },

    async updateSocialAssistance(payload) {
      this.loading = true

      try {
        const response = await axiosInstance.post(`/social-assistance/${payload.id}`, {
          ...payload,
          _method: 'PUT',
        })
        this.success = response.data.message

        router.push({ name: 'manage-social-assistance', params: { id: payload.id } })
        setTimeout(() => {
          this.success = null
        }, 4500)
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async deleteSocialAssistance(id) {
      this.loading = true

      try {
        const response = await axiosInstance.delete(`/social-assistance/${id}`)
        this.success = response.data.message
        setTimeout(() => {
          this.success = null
        }, 4500)
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },
  },
})
