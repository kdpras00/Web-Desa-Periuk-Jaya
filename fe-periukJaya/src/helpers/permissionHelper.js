// gunanya untuk memberikan permission pada vue

import { useAuthStore } from '@/stores/auth'

export const can = (permission) => {
  const authStore = useAuthStore()
  const userPermissions = authStore.user?.permissions || []
  return userPermissions.includes(permission)
}

export const isRole = (role) => {
  const authStore = useAuthStore()
  return authStore.user?.role === role
}