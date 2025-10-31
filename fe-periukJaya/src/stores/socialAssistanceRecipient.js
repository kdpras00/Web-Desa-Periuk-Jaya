import { defineStore } from 'pinia'

import { handleError } from '@/helpers/errorHelper'
import { axiosInstance } from './../plugins/axios'
import router from '@/router'
import { showSuccess, showError } from '@/helpers/sweetAlertHelper'

export const useSocialAssistanceRecipientStore = defineStore('social-assistance-recipient', {
  state: () => ({
    socialAssistanceRecipients: [],
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
    async fetchSocialAssistanceRecipients(params) {
      this.loading = true

      try {
        const response = await axiosInstance.get(`social-assistance-recipient`, {
          params,
        })

        this.socialAssistanceRecipients = response.data.data
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async fetchSocialAssistanceRecipientsPaginated(params) {
      this.loading = true

      try {
        const response = await axiosInstance.get(`social-assistance-recipient/all/paginated`, {
          params,
        })

        this.socialAssistanceRecipients = response.data.data.data
        this.meta = response.data.data.meta
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async fetchSocialAssistanceRecipient(id) {
      this.loading = true
      try {
        const response = await axiosInstance.get(`/social-assistance-recipient/${id}`)

        return response.data.data
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async createSocialAssistanceRecipient(payload) {
      this.loading = true
      this.error = null

      try {
        console.log('Sending payload to backend:', payload)
        const response = await axiosInstance.post('/social-assistance-recipient', payload)
        console.log('Backend response:', response.data)

        // Show success message with SweetAlert2
        await showSuccess(
          'Berhasil!',
          response.data.message || 'Pengajuan bantuan sosial berhasil dikirim',
          2000,
        )

        // Redirect to social assistance list after user sees the success message
        router.push({ name: 'social-assistance' })
      } catch (error) {
        console.error('Error creating social assistance recipient:', error)
        console.error('Error response:', error.response?.data)

        const errorMessage = handleError(error)

        // Show error message with SweetAlert2
        await showError(
          'Gagal!',
          errorMessage || 'Terjadi kesalahan saat mengajukan bantuan sosial',
          'OK',
        )

        this.error = errorMessage
      } finally {
        this.loading = false
      }
    },

    async updateSocialAssistanceRecipient(payload) {
      this.loading = true

      try {
        const formData = new FormData()

        // Append all fields to FormData
        Object.keys(payload).forEach((key) => {
          if (payload[key] !== null && payload[key] !== undefined) {
            // Skip these fields - they are not needed for update or are nested objects
            if (
              key !== 'proof_url' &&
              key !== 'social_assistance' &&
              key !== 'head_of_family' &&
              key !== 'created_at' &&
              key !== 'updated_at'
            ) {
              // Only append proof if it's a File object (newly uploaded)
              if (key === 'proof') {
                if (payload[key] instanceof File) {
                  formData.append(key, payload[key])
                }
                // Skip if it's a string (old URL)
              } else {
                formData.append(key, payload[key])
              }
            }
          }
        })

        // Add _method for Laravel PUT request
        formData.append('_method', 'PUT')

        const response = await axiosInstance.post(
          `/social-assistance-recipient/${payload.id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        )
        this.success = response.data.message

        setTimeout(() => {
          this.success = null
        }, 4500)

        // Return the response data for the component to refresh
        return response.data
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },
  },
})
