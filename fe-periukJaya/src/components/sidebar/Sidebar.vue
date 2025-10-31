<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useSidebarStore } from '@/stores/sidebar'
import { storeToRefs } from 'pinia'
import SidebarItem from "./SidebarItem.vue";
import iconChartActive from "@/assets/images/icons/chart-square-dark-green.svg";
import iconChartInactive from "@/assets/images/icons/chart-square-secondary-green.svg";
import iconCrownActive from "@/assets/images/icons/crown-dark-green.svg";
import iconCrownInactive from "@/assets/images/icons/crown-secondary-green.svg";
import iconBagActive from "@/assets/images/icons/bag-2-dark-green.svg";
import iconBagInactive from "@/assets/images/icons/bag-2-secondary-green.svg";
import iconBuilding4Active from "@/assets/images/icons/building-4-dark-green.svg";
import iconBuilding4Inactive from "@/assets/images/icons/building-4-secondary-green.svg";

const sidebarStore = useSidebarStore()
const { isOpen, isMobile } = storeToRefs(sidebarStore)
const { toggle, setMobile } = sidebarStore

// Check if mobile on mount and resize
const checkMobile = () => {
  const mobile = window.innerWidth < 1024 // lg breakpoint
  setMobile(mobile)
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const sidebarItems = [
  {
    label: "Dashboard",
    path: "/",
    iconActive: iconChartActive,
    iconInactive: iconChartInactive,
    permission: "dashboard-menu",
  },
  {
    label: "Kepala Rumah",
    path: "/head-of-family",
    iconActive: iconCrownActive,
    iconInactive: iconCrownInactive,
    permission: "head-of-family-menu",
  },
  {
    label: "Anggota Keluarga",
    path: "/family-member",
    iconActive: iconCrownActive,
    iconInactive: iconCrownInactive,
    permission: "family-member-menu",
    hideForRoles: ["lurah"],
  },
  {
    label: "Bantuan Sosial",
    path: "",
    iconActive: iconBagActive,
    iconInactive: iconBagInactive,
    children: [
      {
        label: "List Bansos",
        path: "/social-assistance",
        permission: "social-assistance-menu",
      },
      {
        label: "Pengajuan Bansos",
        path: "/social-assistance-recipient",
        permission: "social-assistance-recipient-menu",
      },
    ],
  },

  {
    label: "Jadwal Desa",
    path: "",
    iconActive: iconBagActive,
    iconInactive: iconBagInactive,
    children: [
      {
        label: "Lowongan Pekerjaan",
        path: "/job-vacancy",
        permission: "job-vacancy-menu",
      },

      {
        label: "Event Desa",
        path: "/event",
        permission: "event-menu",
      },
    ],
  },

  {
    label: "Profile Desa",
    path: "/profile",
    iconActive: iconBuilding4Active,
    iconInactive: iconBuilding4Inactive,
    permission: "profile-menu",
  },
];
</script>

<template>
  <!-- Sidebar Container -->
  <aside
    id="Sidebar"
    class="relative flex min-h-screen transition-all duration-300"
    :style="{ width: isOpen ? '280px' : '0' }"
  >
    <!-- Fixed Sidebar Content -->
    <div 
      class="fixed top-0 left-0 h-full w-[280px] z-30 bg-white border-r border-desa-foreshadow transition-transform duration-300 overflow-hidden"
      :style="{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }"
    >
      <div class="flex flex-col h-full w-full gap-6 pt-[30px] px-6">
        <!-- Header with Logo -->
        <div class="flex items-center justify-between">
          <img
            src="@/assets/images/logos/logo-text.svg"
            class="flex h-[30px] shrink-0"
            alt="logo"
          />
        </div>
        
        <!-- Navigation Menu -->
        <div class="flex flex-col flex-1 gap-6 overflow-y-scroll hide-scrollbar">
          <nav class="flex flex-col gap-2 pb-12">
            <p class="font-medium text-sm text-desa-secondary">Main Menu</p>
            <ul class="flex flex-col gap-2">
              <SidebarItem
                v-for="(item, index) in sidebarItems"
                :key="index"
                :item="item"
              />
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </aside>
</template>
