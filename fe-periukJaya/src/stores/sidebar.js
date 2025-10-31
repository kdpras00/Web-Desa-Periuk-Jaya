import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
  // State
  const isOpen = ref(true)
  const isMobile = ref(false)

  // Computed
  const shouldShowOverlay = computed(() => isMobile.value && isOpen.value)

  // Actions
  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  const setMobile = (value) => {
    isMobile.value = value
    // Auto-close sidebar on mobile by default
    if (value) {
      isOpen.value = false
    } else {
      isOpen.value = true
    }
  }

  // Close sidebar when clicking outside on mobile
  const handleOutsideClick = () => {
    if (isMobile.value && isOpen.value) {
      close()
    }
  }

  return {
    isOpen,
    isMobile,
    shouldShowOverlay,
    toggle,
    open,
    close,
    setMobile,
    handleOutsideClick,
  }
})

