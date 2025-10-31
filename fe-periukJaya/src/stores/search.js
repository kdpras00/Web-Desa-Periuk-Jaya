import { defineStore } from 'pinia'
import { axiosInstance } from '@/plugins/axios'
import { handleError } from '@/helpers/errorHelper'

export const useSearchStore = defineStore('search', {
  state: () => ({
    query: '',
    results: {
      headOfFamilies: [],
      socialAssistances: [],
      socialAssistanceRecipients: [],
      jobVacancies: [],
      events: [],
    },
    totalResults: 0,
    loading: false,
    error: null,
    activeTab: 'headOfFamilies',
  }),

  getters: {
    currentResults: (state) => {
      return state.results[state.activeTab] || []
    },
  },

  actions: {
    async search(query) {
      if (!query || query.trim() === '') {
        this.results = {
          headOfFamilies: [],
          socialAssistances: [],
          socialAssistanceRecipients: [],
          jobVacancies: [],
          events: [],
        }
        this.totalResults = 0
        return
      }

      this.loading = true
      this.query = query
      this.error = null

      try {
        const response = await axiosInstance.get('/search', {
          params: { q: query },
        })

        this.results = response.data.data
        
        // Calculate total results
        this.totalResults = Object.values(this.results).reduce((sum, arr) => sum + arr.length, 0)
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    setActiveTab(tab) {
      this.activeTab = tab
    },

    clearSearch() {
      this.query = ''
      this.results = {
        headOfFamilies: [],
        socialAssistances: [],
        socialAssistanceRecipients: [],
        jobVacancies: [],
        events: [],
      }
      this.totalResults = 0
      this.error = null
    },
  },
})

