import { defineStore } from 'pinia'

import { handleError } from '@/helpers/errorHelper'
import { axiosInstance } from './../plugins/axios'
import router from '@/router'

export const useJobVacancyApplicantStore = defineStore('job-vacancy-applicant', {
  state: () => ({
    jobVacanciesApplicants: [],
    recentApplicants: [],
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
    async fetchJobApplicantsByUser(userId) {
      this.loading = true
      this.error = null

      try {
        const response = await axiosInstance.get(`/job-applicant`, {
          params: {
            limit: 3,
            user_id: userId,
          },
        })

        this.recentApplicants = response.data.data || []
        return this.recentApplicants
      } catch (error) {
        this.error = handleError(error)
        this.recentApplicants = []
        return []
      } finally {
        this.loading = false
      }
    },

    async createJobVacancyApplicant(payload) {
      this.loading = true
      this.error = null

      try {
        const response = await axiosInstance.post('/job-applicant', payload)
        this.success = response.data.message

        setTimeout(() => {
          this.success = null
        }, 3000)
        return response
      } catch (error) {
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
