import { defineStore } from 'pinia'
import { handleError } from '@/helpers/errorHelper'
import { axiosInstance } from './../plugins/axios'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    pollingInterval: null,
    pollingEnabled: false,
  }),
  
  actions: {
    async fetchNotifications(silent = false) {
      if (!silent) {
        this.loading = true
      }
      this.error = null

      try {
        const response = await axiosInstance.get('/notifications')
        this.notifications = response.data.data
        this.unreadCount = this.notifications.filter(n => !n.is_read).length
      } catch (error) {
        if (!silent) {
          this.error = handleError(error)
        }
      } finally {
        if (!silent) {
          this.loading = false
        }
      }
    },

    // Start polling for notifications every 30 seconds
    startPolling(interval = 30000) {
      if (this.pollingInterval) {
        this.stopPolling()
      }

      this.pollingEnabled = true
      
      // Initial fetch
      this.fetchNotifications()
      
      // Poll every interval
      this.pollingInterval = setInterval(() => {
        if (this.pollingEnabled) {
          this.fetchNotifications(true) // Silent refresh
        }
      }, interval)
    },

    // Stop polling
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval)
        this.pollingInterval = null
      }
      this.pollingEnabled = false
    },

    async markAsRead(notificationId) {
      try {
        await axiosInstance.put(`/notifications/${notificationId}/read`)
        
        // Update local state
        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification) {
          notification.is_read = true
          this.unreadCount = Math.max(0, this.unreadCount - 1)
        }
      } catch (error) {
        this.error = handleError(error)
      }
    },

    async markAllAsRead() {
      try {
        await axiosInstance.put('/notifications/mark-all-read')
        
        // Update local state
        this.notifications.forEach(n => {
          n.is_read = true
        })
        this.unreadCount = 0
      } catch (error) {
        this.error = handleError(error)
      }
    },

    async deleteNotification(notificationId) {
      try {
        await axiosInstance.delete(`/notifications/${notificationId}`)
        
        // Remove from local state
        const index = this.notifications.findIndex(n => n.id === notificationId)
        if (index !== -1) {
          const wasUnread = !this.notifications[index].is_read
          this.notifications.splice(index, 1)
          if (wasUnread) {
            this.unreadCount = Math.max(0, this.unreadCount - 1)
          }
        }
      } catch (error) {
        this.error = handleError(error)
      }
    },

    // Add new notification (for real-time updates)
    addNotification(notification) {
      this.notifications.unshift(notification)
      if (!notification.is_read) {
        this.unreadCount++
      }
    },
  },
})

