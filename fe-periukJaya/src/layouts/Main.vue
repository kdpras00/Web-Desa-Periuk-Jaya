<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useSidebarStore } from '@/stores/sidebar'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'
import Sidebar from '@/components/sidebar/Sidebar.vue'
import Topbar from '@/components/Topbar.vue'

const sidebarStore = useSidebarStore()
const { shouldShowOverlay } = storeToRefs(sidebarStore)
const { handleOutsideClick } = sidebarStore

const notificationStore = useNotificationStore()

// Start polling when component mounts
onMounted(() => {
  notificationStore.startPolling(30000) // Poll every 30 seconds
})

// Stop polling when component unmounts
onUnmounted(() => {
  notificationStore.stopPolling()
})
</script>

<template>
  <div class="flex flex-1 overflow-hidden relative">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Overlay for Mobile -->
    <Transition name="overlay">
      <div
        v-if="shouldShowOverlay"
        @click="handleOutsideClick"
        class="fixed inset-0 bg-black/50 z-20 lg:hidden"
      ></div>
    </Transition>

    <!-- Main Content -->
    <div id="Main-Container" class="flex flex-col flex-1 overflow-hidden min-w-0">
      <Topbar />

      <div
        id="Content"
        class="relative flex flex-col gap-[14px] p-6 pb-[30px] w-full overflow-x-hidden overflow-y-auto"
      >
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
