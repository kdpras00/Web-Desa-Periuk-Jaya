<script setup>
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirm, showToast } from '@/helpers/sweetAlertHelper'

const router = useRouter()
const notificationStore = useNotificationStore()
const { notifications, unreadCount, loading } = storeToRefs(notificationStore)
const { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = notificationStore

const showDropdown = ref(false)

onMounted(async () => {
  console.log('NotificationDropdown mounted, fetching notifications...')
  await fetchNotifications()
  console.log('Notifications fetched:', notifications.value.length)
})

onBeforeUnmount(() => {
  // Cleanup: restore body scroll when component unmounts
  document.body.style.overflow = ''
})

const toggleDropdown = async () => {
  showDropdown.value = !showDropdown.value

  // Prevent body scroll when dropdown is open
  if (showDropdown.value) {
    document.body.style.overflow = 'hidden'
    await fetchNotifications(true) // Silent refresh
  } else {
    document.body.style.overflow = ''
  }
}

const closeDropdown = () => {
  showDropdown.value = false
  // Restore body scroll
  document.body.style.overflow = ''
}

const handleViewAllNotifications = () => {
  console.log('Navigating to notifications page...')
  closeDropdown()
  // Small delay to ensure dropdown closes smoothly
  setTimeout(() => {
    router.push({ name: 'notifications' })
  }, 100)
}

const handleNotificationClick = async (notification) => {
  // Mark as read
  if (!notification.is_read) {
    await markAsRead(notification.id)
  }

  // Navigate to related page based on notification type
  if (notification.link) {
    closeDropdown()
    router.push(notification.link)
  } else {
    closeDropdown()
  }
}

const handleMarkAllRead = async () => {
  console.log('handleMarkAllRead called, unreadCount:', unreadCount.value)
  
  if (unreadCount.value === 0) {
    showToast('info', 'Tidak ada notifikasi yang belum dibaca')
    return
  }

  const result = await showConfirm(
    'Tandai Semua Sebagai Dibaca?',
    `Apakah Anda yakin ingin menandai ${unreadCount.value} notifikasi sebagai dibaca?`,
    'Ya, Tandai Semua',
    'Batal'
  )

  if (result.isConfirmed) {
    console.log('Marking all as read...')
    await markAllAsRead()
    showToast('success', 'Semua notifikasi telah ditandai sebagai dibaca')
  }
}

const handleDelete = async (notificationId, event) => {
  event.stopPropagation()

  const result = await showConfirm(
    'Hapus Notifikasi?',
    'Apakah Anda yakin ingin menghapus notifikasi ini?',
    'Ya, Hapus',
    'Batal'
  )

  if (result.isConfirmed) {
    await deleteNotification(notificationId)
    showToast('success', 'Notifikasi berhasil dihapus')
  }
}

// Watch for notifications changes
watch(notifications, (newVal) => {
  console.log('Notifications updated:', newVal.length)
}, { deep: true })

const getNotificationIcon = (type) => {
  const iconMap = {
    'social-assistance': 'receipt-search-secondary-green',
    'event': 'calendar-search-secondary-green',
    'job-vacancy': 'box-search-secondary-green',
    'family': 'user-search-secondary-green',
    'system': 'notification-secondary-green',
  }

  const iconName = iconMap[type] || 'notification-secondary-green'

  try {
    return new URL(`../assets/images/icons/${iconName}.svg`, import.meta.url).href
  } catch {
    return new URL(`../assets/images/icons/notification-secondary-green.svg`, import.meta.url).href
  }
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins} menit lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`
  if (diffDays < 7) return `${diffDays} hari lalu`

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="relative">
    <!-- Notification Button -->
    <button
      @click="toggleDropdown"
      class="relative flex size-14 shrink-0 items-center justify-center rounded-2xl border border-desa-background hover:border-desa-secondary transition-all duration-300"
      :class="{ 'border-desa-dark-green bg-desa-dark-green/5': showDropdown }"
    >
      <img
        src="@/assets/images/icons/notification-secondary-green.svg"
        class="size-6"
        alt="icon"
      />

      <!-- Unread Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div
        v-if="showDropdown"
        class="fixed top-[130px] right-6 bg-white rounded-3xl shadow-2xl border border-desa-background z-[9999] flex flex-col"
        style="width: 750px; max-width: calc(100vw - 3rem); max-height: calc(100vh - 150px);"
        @click.stop
        @mousedown.stop
        @mouseup.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-desa-background shrink-0 bg-white rounded-t-3xl">
          <div class="flex items-center gap-3">
            <h3 class="text-xl font-semibold text-desa-black">Notifikasi</h3>
            <span
              v-if="unreadCount > 0"
              class="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-2"
            >
              {{ unreadCount }}
            </span>
          </div>
          <button
            v-if="unreadCount > 0"
            @click.stop.prevent="handleMarkAllRead"
            @mousedown.stop
            @mouseup.stop
            class="flex items-center gap-2 text-sm text-desa-dark-green hover:text-desa-dark-green/80 font-medium whitespace-nowrap transition-colors cursor-pointer z-[10000]"
            title="Tandai semua notifikasi sebagai sudah dibaca"
            type="button"
          >
            <img
              src="@/assets/images/icons/tick-circle-secondary-green.svg"
              class="size-4 pointer-events-none"
              alt="icon"
            />
            Tandai Semua Dibaca
          </button>
        </div>

        <!-- Notifications List -->
        <div class="overflow-y-auto overflow-x-hidden custom-scrollbar flex-1">
          <!-- Loading State -->
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-desa-dark-green"></div>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="notifications.length === 0"
            class="flex flex-col items-center justify-center py-12 px-6 text-center"
          >
            <img
              src="@/assets/images/icons/notification-secondary-green.svg"
              class="size-16 mb-4 opacity-50"
              alt="icon"
            />
            <p class="text-lg font-semibold text-desa-secondary mb-2">
              Tidak ada notifikasi
            </p>
            <p class="text-sm text-desa-secondary">
              Notifikasi baru akan muncul di sini
            </p>
          </div>

          <!-- Notification Items -->
          <div v-else class="divide-y divide-desa-background">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              @click="handleNotificationClick(notification)"
              class="flex items-start gap-4 px-6 py-5 hover:bg-desa-background/50 cursor-pointer transition-colors relative group"
              :class="{ 'bg-desa-dark-green/5': !notification.is_read }"
            >
              <!-- Icon -->
              <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-desa-background">
                <img
                  :src="getNotificationIcon(notification.type)"
                  class="size-6"
                  alt="icon"
                />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-base text-desa-black mb-1.5">
                  {{ notification.title }}
                </h4>
                <p class="text-sm text-desa-secondary line-clamp-2 leading-relaxed">
                  {{ notification.message }}
                </p>
                <p class="text-xs text-desa-secondary mt-2">
                  {{ formatTime(notification.created_at) }}
                </p>
              </div>

              <!-- Unread Indicator -->
              <div
                v-if="!notification.is_read"
                class="size-2.5 rounded-full bg-desa-dark-green shrink-0 mt-2"
              ></div>

              <!-- Delete Button (show on hover) -->
              <button
                @click="handleDelete(notification.id, $event)"
                class="absolute top-5 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <img
                  src="@/assets/images/icons/close-circle-secondary-green.svg"
                  class="size-5 hover:scale-110 transition-transform"
                  alt="delete"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          v-if="notifications.length > 0"
          class="px-6 py-5 border-t border-desa-background text-center bg-white shrink-0 rounded-b-3xl"
        >
          <button
            @click.stop.prevent="handleViewAllNotifications"
            @mousedown.stop
            @mouseup.stop
            class="text-sm text-desa-dark-green hover:text-desa-dark-green/80 font-medium hover:underline transition-all cursor-pointer z-[10000]"
            title="Buka halaman notifikasi lengkap"
            type="button"
          >
            Lihat Semua Notifikasi
          </button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <Teleport to="body">
      <Transition name="backdrop">
        <div
          v-if="showDropdown"
          class="fixed inset-0 z-[9998]"
          @click="closeDropdown"
          @mousedown.stop
        ></div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.dropdown-enter-active {
  transition: all 0.2s ease-out;
}

.dropdown-leave-active {
  transition: all 0.15s ease-in;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.98);
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom Scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #10B981 #F3F4F6;
  overflow-y: auto !important;
  overflow-x: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  position: relative;
  z-index: 1;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 10px;
  margin: 8px 0;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #10B981;
  border-radius: 10px;
  transition: background 0.3s ease;
  border: 3px solid #F3F4F6;
  min-height: 50px;
  cursor: pointer;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #059669;
  border: 3px solid #F3F4F6;
}

.custom-scrollbar::-webkit-scrollbar-thumb:active {
  background: #047857;
  cursor: grabbing;
}
</style>
