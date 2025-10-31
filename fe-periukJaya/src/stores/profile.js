import { defineStore } from 'pinia'

import { handleError } from '@/helpers/errorHelper'
import { axiosInstance } from './../plugins/axios'
import router from '@/router'
import Swal from 'sweetalert2'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null,
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
    async fetchProfile() {
      this.loading = true
      try {
        const response = await axiosInstance.get(`/profile`)

        this.profile = response.data.data
        return response.data.data
      } catch (error) {
        this.error = handleError(error)
        return null
      } finally {
        this.loading = false
      }
    },

    async createProfile(payload) {
      this.loading = true
      this.error = null

      try {
        // Create FormData for file upload
        const formData = new FormData()
        
        // Add thumbnail
        formData.append('thumbnail', payload.thumbnail)
        
        // Add text fields
        formData.append('name', payload.name)
        formData.append('about', payload.about)
        formData.append('headman', payload.headman)
        formData.append('people', payload.people)
        formData.append('agricultural_area', payload.agricultural_area)
        formData.append('total_area', payload.total_area)
        
        // Add coordinates if provided
        if (payload.latitude) formData.append('latitude', payload.latitude)
        if (payload.longitude) formData.append('longitude', payload.longitude)
        
        // Add images array if exists
        if (payload.images && Array.isArray(payload.images)) {
          payload.images.forEach((image, index) => {
            formData.append(`images[${index}]`, image)
          })
        }
        
        const response = await axiosInstance.post('/profile', formData)
        
        this.success = response.data.message

        setTimeout(() => {
          this.success = null
        }, 3000)
        router.push({ name: 'profile' })
      } catch (error) {
        this.error = handleError(error)

        setTimeout(() => {
          this.error = null
        }, 5000)
      } finally {
        this.loading = false
      }
    },

    async updateProfile(payload) {
      this.loading = true
      this.error = null

      try {
        // Create FormData for file upload
        const formData = new FormData()
        
        // Add thumbnail only if new file is uploaded
        if (payload.thumbnail instanceof File) {
          formData.append('thumbnail', payload.thumbnail)
        }
        
        // Add text fields
        formData.append('name', payload.name)
        formData.append('about', payload.about)
        formData.append('headman', payload.headman)
        formData.append('people', payload.people)
        formData.append('agricultural_area', payload.agricultural_area)
        formData.append('total_area', payload.total_area)
        
        // Add coordinates if provided
        if (payload.latitude) formData.append('latitude', payload.latitude)
        if (payload.longitude) formData.append('longitude', payload.longitude)
        
        // Add images array if exists
        if (payload.images && Array.isArray(payload.images)) {
          payload.images.forEach((image, index) => {
            if (image instanceof File) {
              formData.append(`images[${index}]`, image)
            }
          })
        }
        
        // Add _method for Laravel PUT request
        formData.append('_method', 'PUT')
        
        const response = await axiosInstance.post('/profile', formData)
        
        this.success = response.data.message

        setTimeout(() => {
          this.success = null
        }, 3000)
        router.push({ name: 'profile' })
      } catch (error) {
        this.error = handleError(error)

        setTimeout(() => {
          this.error = null
        }, 5000)
      } finally {
        this.loading = false
      }
    },

    async deleteProfile() {
      this.loading = true
      this.error = null

      try {
        const response = await axiosInstance.delete('/profile')
        
        this.success = response.data.message
        this.profile = null

        await Swal.fire({
          title: 'Berhasil!',
          text: response.data.message || 'Profile desa berhasil dihapus',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        })
        
        // Reload page to show empty state
        window.location.reload()
      } catch (error) {
        this.error = handleError(error)
        
        await Swal.fire({
          title: 'Gagal!',
          text: this.error || 'Gagal menghapus profile desa',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        })

        setTimeout(() => {
          this.error = null
        }, 5000)
      } finally {
        this.loading = false
      }
    },
  },
})
