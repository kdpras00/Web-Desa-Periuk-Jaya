import { defineStore } from 'pinia'

import { handleError } from '@/helpers/errorHelper'
import { axiosInstance } from './../plugins/axios'
import router from '@/router'

export const useEventStore = defineStore('event', {
  state: () => ({
    events: [],
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
    async fetchEventsPaginated(params) {
      this.loading = true

      try {
        const response = await axiosInstance.get(`event/all/paginated`, { params })

        this.events = response.data.data.data
        this.meta = response.data.data.meta
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async fetchEvent(id) {
      this.loading = true
      try {
        const response = await axiosInstance.get(`/event/${id}`)

        return response.data.data
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async createEvent(payload) {
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

        // Log FormData contents for debugging
        console.log('FormData contents:')
        for (let pair of formData.entries()) {
          console.log(pair[0] + ':', pair[1])
        }

        const response = await axiosInstance.post('/event', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.success = response.data.message

        setTimeout(() => {
          this.success = null
        }, 3000)
        router.push({ name: 'event' })
      } catch (error) {
        console.error('Event creation error:', error.response?.data)
        this.error = handleError(error)

        setTimeout(() => {
          this.error = null
        }, 5000)
      } finally {
        this.loading = false
      }
    },

    async updateEvent(payload) {
      this.loading = true

      try {
        const formData = new FormData()
        
        // Append all fields to FormData
        Object.keys(payload).forEach(key => {
          if (payload[key] !== null && payload[key] !== undefined && payload[key] !== '') {
            // Skip these fields
            if (key !== 'thumbnail_url' && key !== 'created_at' && key !== 'updated_at' && key !== 'event_participants') {
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

        // Log FormData contents for debugging
        console.log('Update FormData contents:')
        for (let pair of formData.entries()) {
          console.log(pair[0] + ':', pair[1])
        }

        const response = await axiosInstance.post(`/event/${payload.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.success = response.data.message

        router.push({ name: 'manage-event', params: { id: payload.id } })
        setTimeout(() => {
          this.success = null
        }, 4500)
      } catch (error) {
        console.error('Event update error:', error.response?.data)
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },
  },
})
