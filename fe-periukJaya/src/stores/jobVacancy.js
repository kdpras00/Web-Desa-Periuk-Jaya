import { defineStore } from 'pinia'

import { handleError } from '@/helpers/errorHelper'
import { axiosInstance } from './../plugins/axios'
import router from '@/router'

export const useJobVacancyStore = defineStore('job-vacancy', {
  state: () => ({
    jobVacancies: [],
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
    async fetchJobVacanciesPaginated(params) {
      this.loading = true

      try {
        const response = await axiosInstance.get(`job-vacancy/all/paginated`, { params })

        this.jobVacancies = response.data.data.data
        this.meta = response.data.data.meta
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async fetchJobVacancy(id) {
      this.loading = true
      try {
        const response = await axiosInstance.get(`/job-vacancy/${id}`)

        return response.data.data
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async createJobVacancy(payload) {
      this.loading = true
      this.error = null

      try {
        const formData = new FormData()
        
        // Append all fields to FormData
        Object.keys(payload).forEach(key => {
          if (payload[key] !== null && payload[key] !== undefined && payload[key] !== '') {
            // Skip these fields
            if (key !== 'id' && key !== 'thumbnail_url') {
              formData.append(key, payload[key])
            }
          }
        })

        const response = await axiosInstance.post('/job-vacancy', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.success = response.data.message

        setTimeout(() => {
          this.success = null
        }, 3000)
        router.push({ name: 'job-vacancy' })
      } catch (error) {
        this.error = handleError(error)

        setTimeout(() => {
          this.error = null
        }, 5000)
      } finally {
        this.loading = false
      }
    },

    async updateJobVacancy(payload) {
      this.loading = true

      try {
        const formData = new FormData()
        
        // Append all fields to FormData
        Object.keys(payload).forEach(key => {
          if (payload[key] !== null && payload[key] !== undefined && payload[key] !== '') {
            // Skip these fields
            if (key !== 'thumbnail_url' && key !== 'created_at' && key !== 'updated_at' && key !== 'job_applicants') {
              // Only append thumbnail if it's a File object (newly uploaded)
              if (key === 'thumbnail') {
                if (payload[key] instanceof File) {
                  formData.append(key, payload[key])
                }
                // Skip if it's null (no new upload)
              } else {
                formData.append(key, payload[key])
              }
            }
          }
        })
        
        // Add _method for Laravel PUT request
        formData.append('_method', 'PUT')

        const response = await axiosInstance.post(`/job-vacancy/${payload.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.success = response.data.message

        router.push({ name: 'manage-job-vacancy', params: { id: payload.id } })
        setTimeout(() => {
          this.success = null
        }, 4500)
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async deleteJobVacancy(id) {
      this.loading = true

      try {
        const response = await axiosInstance.delete(`/job-vacancy/${id}`)
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

    // Add method to update job applicant status
    async updateJobApplicantStatus(applicantId, status) {
      this.loading = true
      this.error = null

      try {
        // Use PATCH method with the dedicated status endpoint
        const response = await axiosInstance.patch(`/job-applicant/${applicantId}/status`, {
          status: status,
        })

        this.success = response.data.message

        setTimeout(() => {
          this.success = null
        }, 3000)

        return response.data.data
      } catch (error) {
        console.error('Error updating job applicant status:', error)
        this.error = handleError(error)

        setTimeout(() => {
          this.error = null
        }, 5000)

        throw error
      } finally {
        this.loading = false
      }
    },
  },
})