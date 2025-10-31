import { defineStore } from 'pinia'

import { handleError } from '@/helpers/errorHelper'
import { axiosInstance } from './../plugins/axios'
import router from '@/router'

export const useHeadOfFamilyStore = defineStore('head-of-family', {
  state: () => ({
    headOfFamilies: [],
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
    },
    loading: false,
    error: null,
    success: null,
  }),

  actions: {
    async fetchHeadOfFamilies(params) {
      this.loading = true

      try {
        const response = await axiosInstance.get(`head-of-family`, { params })

        this.headOfFamilies = response.data.data
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async fetchHeadOfFamiliesPaginated(params) {
      this.loading = true

      try {
        const response = await axiosInstance.get(`head-of-family/all/paginated`, { params })

        this.headOfFamilies = response.data.data.data
        this.meta = response.data.data.meta
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async fetchHeadOfFamily(id) {
      this.loading = true

      try {
        const response = await axiosInstance.get(`/head-of-family/${id}`)

        return response.data.data
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async createHeadOfFamily(payload) {
      this.loading = true
      this.error = null

      try {
        // Convert payload to FormData for file upload
        const formData = new FormData()
        
        // Append all fields to FormData
        Object.keys(payload).forEach(key => {
          // Skip profile_picture_url and age as they're not needed in backend
          if (key !== 'profile_picture_url' && key !== 'age') {
            // Only append if value exists
            if (payload[key] !== null && payload[key] !== undefined && payload[key] !== '') {
              formData.append(key, payload[key])
            }
          }
        })

        const response = await axiosInstance.post('/head-of-family', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.success = response.data.message

        setTimeout(() => {
          this.success = null
        }, 3000)
        router.push({ name: 'head-of-family' })
      } catch (error) {
        this.error = handleError(error)

        setTimeout(() => {
          this.error = null
        }, 5000)
      } finally {
        this.loading = false
      }
    },

    async deleteHeadOfFamily(id) {
      this.loading = true

      try {
        const response = await axiosInstance.delete(`/head-of-family/${id}`)
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
