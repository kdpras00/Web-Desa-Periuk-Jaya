import { defineStore } from 'pinia'

import { handleError } from '@/helpers/errorHelper'
import { axiosInstance } from './../plugins/axios'
import router from '@/router'

export const useFamilyMemberStore = defineStore('family-member', {
  state: () => ({
    familyMembers: [],
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
    async fetchFamilyMembers(params) {
      this.loading = true

      try {
        const response = await axiosInstance.get(`family-member`, { params })

        this.familyMembers = response.data.data
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async fetchFamilyMembersPaginated(params) {
      this.loading = true

      try {
        const response = await axiosInstance.get(`family-member/all/paginated`, { params })

        this.familyMembers = response.data.data.data
        this.meta = response.data.data.meta
      } catch (error) {
        this.error = handleError(error)
        this.familyMembers = []
      } finally {
        this.loading = false
      }
    },

    async fetchFamilyMember(id) {
      this.loading = true

      try {
        const response = await axiosInstance.get(`/family-member/${id}`)

        return response.data.data
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

    async createFamilyMember(payload) {
      this.loading = true
      this.error = null

      try {
        const formData = new FormData()
        
        // List of fields to skip (internal UI fields, not sent to backend)
        const skipFields = ['profile_picture_url', 'age']
        
        // Append all fields to FormData
        Object.keys(payload).forEach(key => {
          // Skip internal fields
          if (skipFields.includes(key)) {
            return
          }
          
          // Only append if value exists (null, undefined, empty string are skipped)
          // But be careful: some fields like 'age' should not be sent
          if (payload[key] !== null && payload[key] !== undefined && payload[key] !== '') {
            // Convert identity_number to integer as required by backend
            // Note: FormData will convert it to string anyway, but backend should accept it
            if (key === 'identity_number') {
              const numValue = parseInt(payload[key], 10)
              if (!isNaN(numValue)) {
                formData.append(key, numValue)
              } else {
                formData.append(key, payload[key])
              }
            } else {
              formData.append(key, payload[key])
            }
          }
        })

        // Don't set Content-Type header manually - let axios/browser set it automatically with boundary
        // This ensures CSRF token header is also sent correctly
        const response = await axiosInstance.post('/family-member', formData)
        this.success = response.data.message

        setTimeout(() => {
          this.success = null
        }, 3000)
        
        // Return response for component to handle navigation
        return response
      } catch (error) {
        // Only log unexpected errors (not validation errors) in development
        // Validation errors (422) are expected and handled gracefully in component
        if (import.meta.env.DEV && error.response?.status !== 422) {
          console.error('Error creating family member:', error)
          console.error('Error response:', error.response?.data)
        }
        
        this.error = handleError(error)

        setTimeout(() => {
          this.error = null
        }, 5000)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteFamilyMember(id) {
      this.loading = true

      try {
        const response = await axiosInstance.delete(`/family-member/${id}`)
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
