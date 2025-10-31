<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { showConfirm, showToast } from '@/helpers/sweetAlertHelper'

const router = useRouter()
const notificationStore = useNotificationStore()
const { notifications, unreadCount, loading } = storeToRefs(notificationStore)
const { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = notificationStore

const searchQuery = ref('')
const filterType = ref('all')
const selectedType = ref('all')
const currentPage = ref(1)
const itemsPerPage = 10

const filteredNotifications = computed(() => {
  let filtered = [...notifications.value]

  if (filterType.value === 'unread') {
    filtered = filtered.filter(n => !n.is_read)
  } else if (filterType.value === 'read') {
    filtered = filtered.filter(n => n.is_read)
  }

  if (selectedType.value !== 'all') {
    filtered = filtered.filter(n => n.type === selectedType.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.message.toLowerCase().includes(query)
    )
  }

  return filtered
})

const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredNotifications.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredNotifications.value.length / itemsPerPage)
})

const stats = computed(() => {
  return {
    total: notifications.value.length,
    unread: notifications.value.filter(n => !n.is_read).length,
    read: notifications.value.filter(n => n.is_read).length,
  }
})

watch([filterType, selectedType, searchQuery], () => {
  currentPage.value = 1
})

onMounted(async () => {
  await fetchNotifications()
})

const handleNotificationClick = async (notification) => {
  if (!notification.is_read) {
    await markAsRead(notification.id)
  }
  if (notification.link) {
    router.push(notification.link)
  }
}

const handleMarkAllRead = async () => {
  if (unreadCount.value === 0) {
    showToast('info', 'Tidak ada notifikasi yang belum dibaca')
    return
  }
  const result = await showConfirm(
    'Tandai Semua Sebagai Dibaca?',
    'Apakah Anda yakin ingin menandai ' + unreadCount.value + ' notifikasi sebagai dibaca?',
    'Ya, Tandai Semua',
    'Batal'
  )
  if (result.isConfirmed) {
    await markAllAsRead()
    showToast('success', 'Semua notifikasi telah ditandai sebagai dibaca')
  }
}

const handleDelete = async (notificationId) => {
  const result = await showConfirm(
    'Hapus Notifikasi?',
    'Apakah Anda yakin ingin menghapus notifikasi ini?',
    'Ya, Hapus',
    'Batal'
  )
  if (result.isConfirmed) {
    await deleteNotification(notificationId)
    showToast('success', 'Notifikasi berhasil dihapus')
    if (paginatedNotifications.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  }
}

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
    return new URL('../assets/images/icons/' + iconName + '.svg', import.meta.url).href
  } catch (error) {
    return new URL('../assets/images/icons/notification-secondary-green.svg', import.meta.url).href
  }
}

const getTypeLabel = (type) => {
  const labels = {
    'social-assistance': 'Bantuan Sosial',
    'event': 'Acara',
    'job-vacancy': 'Lowongan Kerja',
    'family': 'Keluarga',
    'system': 'Sistem',
  }
  return labels[type] || 'Lainnya'
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return diffMins + ' menit lalu'
  if (diffHours < 24) return diffHours + ' jam lalu'
  if (diffDays < 7) return diffDays + ' hari lalu'

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8">
    <div class="flex flex-col gap-2">
      <h1 class="text-3xl font-bold text-desa-black">Notifikasi</h1>
      <p class="text-base text-desa-secondary">Kelola dan lihat semua notifikasi Anda</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl p-6 border border-desa-background">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-desa-secondary mb-1">Total Notifikasi</p>
            <p class="text-3xl font-bold text-desa-black">{{ stats.total }}</p>
          </div>
          <div class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-blue-100">
            <img src="@/assets/images/icons/notification-secondary-green.svg" class="size-7" alt="icon" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-6 border border-desa-background">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-desa-secondary mb-1">Belum Dibaca</p>
            <p class="text-3xl font-bold text-red-500">{{ stats.unread }}</p>
          </div>
          <div class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-red-100">
            <img src="@/assets/images/icons/notification-secondary-green.svg" class="size-7" alt="icon" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-6 border border-desa-background">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-desa-secondary mb-1">Sudah Dibaca</p>
            <p class="text-3xl font-bold text-green-500">{{ stats.read }}</p>
          </div>
          <div class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-green-100">
            <img src="@/assets/images/icons/tick-circle-secondary-green.svg" class="size-7" alt="icon" />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 border border-desa-background">
      <div class="flex flex-col lg:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <img src="@/assets/images/icons/search-normal-secondary-green.svg" class="absolute left-4 top-1/2 -translate-y-1/2 size-5 pointer-events-none z-10" alt="search" />
            <input v-model="searchQuery" type="text" placeholder="Cari notifikasi..." class="w-full py-3 pl-12 pr-4 border border-desa-background rounded-xl focus:outline-none focus:border-desa-dark-green transition-colors" />
          </div>
        </div>
        <div class="flex gap-2">
          <button @click="filterType = 'all'" class="px-4 py-3 rounded-xl font-medium transition-all" :class="filterType === 'all' ? 'bg-desa-dark-green text-white' : 'bg-desa-background text-desa-secondary hover:bg-desa-dark-green/10'">Semua</button>
          <button @click="filterType = 'unread'" class="px-4 py-3 rounded-xl font-medium transition-all" :class="filterType === 'unread' ? 'bg-desa-dark-green text-white' : 'bg-desa-background text-desa-secondary hover:bg-desa-dark-green/10'">Belum Dibaca</button>
          <button @click="filterType = 'read'" class="px-4 py-3 rounded-xl font-medium transition-all" :class="filterType === 'read' ? 'bg-desa-dark-green text-white' : 'bg-desa-background text-desa-secondary hover:bg-desa-dark-green/10'">Dibaca</button>
        </div>
        <button v-if="unreadCount > 0" @click="handleMarkAllRead" class="px-6 py-3 bg-desa-dark-green text-white rounded-xl font-medium hover:bg-desa-dark-green/90 transition-all flex items-center gap-2 whitespace-nowrap">
          <img src="@/assets/images/icons/tick-circle-white.svg" class="size-5" alt="icon" />
          Tandai Semua Dibaca
        </button>
      </div>
      <div class="flex gap-2 mt-4 flex-wrap">
        <button @click="selectedType = 'all'" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" :class="selectedType === 'all' ? 'bg-desa-dark-green text-white' : 'bg-desa-background text-desa-secondary hover:bg-desa-dark-green/10'">Semua Tipe</button>
        <button @click="selectedType = 'social-assistance'" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" :class="selectedType === 'social-assistance' ? 'bg-desa-dark-green text-white' : 'bg-desa-background text-desa-secondary hover:bg-desa-dark-green/10'">Bantuan Sosial</button>
        <button @click="selectedType = 'event'" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" :class="selectedType === 'event' ? 'bg-desa-dark-green text-white' : 'bg-desa-background text-desa-secondary hover:bg-desa-dark-green/10'">Acara</button>
        <button @click="selectedType = 'job-vacancy'" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" :class="selectedType === 'job-vacancy' ? 'bg-desa-dark-green text-white' : 'bg-desa-background text-desa-secondary hover:bg-desa-dark-green/10'">Lowongan Kerja</button>
        <button @click="selectedType = 'family'" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" :class="selectedType === 'family' ? 'bg-desa-dark-green text-white' : 'bg-desa-background text-desa-secondary hover:bg-desa-dark-green/10'">Keluarga</button>
        <button @click="selectedType = 'system'" class="px-4 py-2 rounded-lg text-sm font-medium transition-all" :class="selectedType === 'system' ? 'bg-desa-dark-green text-white' : 'bg-desa-background text-desa-secondary hover:bg-desa-dark-green/10'">Sistem</button>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-desa-background overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-desa-dark-green"></div>
      </div>
      <div v-else-if="paginatedNotifications.length === 0" class="flex flex-col items-center justify-center py-16 px-6 text-center">
        <img src="@/assets/images/icons/notification-secondary-green.svg" class="size-20 mb-6 opacity-50" alt="icon" />
        <p class="text-xl font-semibold text-desa-secondary mb-2">Tidak ada notifikasi</p>
        <p class="text-sm text-desa-secondary">Notifikasi baru akan muncul di sini</p>
      </div>
      <div v-else class="divide-y divide-desa-background">
        <div v-for="notification in paginatedNotifications" :key="notification.id" class="flex items-start gap-6 p-6 hover:bg-desa-background/50 transition-colors relative group" :class="{ 'bg-desa-dark-green/5': !notification.is_read }">
          <div class="flex size-14 shrink-0 items-center justify-center rounded-xl cursor-pointer" :class="notification.is_read ? 'bg-desa-background' : 'bg-desa-dark-green/10'" @click="handleNotificationClick(notification)">
            <img :src="getNotificationIcon(notification.type)" class="size-7" alt="icon" />
          </div>
          <div class="flex-1 min-w-0 cursor-pointer" @click="handleNotificationClick(notification)">
            <div class="flex items-start justify-between gap-4 mb-2">
              <h3 class="font-semibold text-lg text-desa-black">{{ notification.title }}</h3>
              <div v-if="!notification.is_read" class="size-3 rounded-full bg-red-500 shrink-0 mt-1.5"></div>
            </div>
            <p class="text-base text-desa-secondary leading-relaxed mb-3">{{ notification.message }}</p>
            <div class="flex items-center gap-4 text-sm text-desa-secondary">
              <span class="flex items-center gap-1.5">
                <img src="@/assets/images/icons/clock-secondary-green.svg" class="size-4" alt="clock" />
                {{ formatTime(notification.created_at) }}
              </span>
              <span class="px-3 py-1 bg-desa-background rounded-lg text-xs font-medium">{{ getTypeLabel(notification.type) }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button v-if="!notification.is_read" @click="markAsRead(notification.id)" class="flex size-10 items-center justify-center rounded-lg bg-green-100 hover:bg-green-200 transition-colors" title="Tandai sebagai dibaca">
              <img src="@/assets/images/icons/tick-circle-secondary-green.svg" class="size-5" alt="mark read" />
            </button>
            <button @click="handleDelete(notification.id)" class="flex size-10 items-center justify-center rounded-lg bg-red-100 hover:bg-red-200 transition-colors" title="Hapus notifikasi">
              <img src="@/assets/images/icons/trash-secondary-green.svg" class="size-5" alt="delete" />
            </button>
          </div>
        </div>
      </div>
      <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-5 border-t border-desa-background">
        <p class="text-sm text-desa-secondary">Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredNotifications.length) }} dari {{ filteredNotifications.length }} notifikasi</p>
        <div class="flex items-center gap-2">
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="flex size-10 items-center justify-center rounded-lg border border-desa-background hover:bg-desa-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <img src="@/assets/images/icons/arrow-left-secondary-green.svg" class="size-5" alt="previous" />
          </button>
          <div class="flex gap-1">
            <button v-for="page in totalPages" :key="page" v-show="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)" @click="goToPage(page)" class="flex size-10 items-center justify-center rounded-lg font-medium transition-all" :class="page === currentPage ? 'bg-desa-dark-green text-white' : 'border border-desa-background hover:bg-desa-background text-desa-secondary'">{{ page }}</button>
          </div>
          <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="flex size-10 items-center justify-center rounded-lg border border-desa-background hover:bg-desa-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <img src="@/assets/images/icons/arrow-right-secondary-green.svg" class="size-5" alt="next" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
