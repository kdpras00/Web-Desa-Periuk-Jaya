import { defineStore } from 'pinia'
import { axiosInstance } from './../plugins/axios'
import { handleError } from '@/helpers/errorHelper'
export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    dashboardData: {},
    loading: false,
    error: null,
    success: null,
  }),

  actions: {
    async fetchDashboardData(retryCount = 0) {
      this.loading = true

      try {
        const response = await axiosInstance.get('/dashboard/get-dashboard-data')

        this.dashboardData = response.data.data
      } catch (error) {
        // If 401 and this is first attempt, retry once after delay
        // This handles race condition where session cookie isn't fully active yet
        if (error.response?.status === 401 && retryCount === 0) {
          await new Promise(resolve => setTimeout(resolve, 500))
          return this.fetchDashboardData(1)
        }
        
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },
  },
})
