<script setup>
import { useAuthStore } from "@/stores/auth";
import { useSidebarStore } from "@/stores/sidebar";
import { storeToRefs } from "pinia";
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showLoading, showLogoutConfirm, showLogoutSuccess } from '@/helpers/sweetAlertHelper';
import defaultProfileImage from '@/assets/images/photos/photo-1.png';
import NotificationDropdown from '@/components/NotificationDropdown.vue';

const router = useRouter();
const authStore = useAuthStore();
const sidebarStore = useSidebarStore();
const { user } = storeToRefs(authStore);
const { isOpen } = storeToRefs(sidebarStore);
const { logout } = authStore;
const { toggle } = sidebarStore;

const searchQuery = ref('');

const handleSearch = (e) => {
  e.preventDefault();
  if (searchQuery.value.trim()) {
    router.push({ name: 'search', query: { q: searchQuery.value.trim() } });
  }
};

const handleLogout = async () => {
  const result = await showLogoutConfirm();

  if (result.isConfirmed) {
    // Show loading
    showLoading('Sedang Logout...', 'Mohon tunggu sebentar');

    await logout();

    // Show success message
    await showLogoutSuccess();
  }
};

const calculateAge = (dateString) => {
  if (!dateString) return '';
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const getProfilePicture = () => {
  // For lurah users, use their profile picture from the users table
  if (user.value?.role === 'lurah' && user.value?.profile_picture) {
    return user.value.profile_picture;
  }
  
  // For head-of-family users, use their profile picture from the head_of_families table
  if (user.value?.role === 'head-of-family' && user.value?.head_of_family?.profile_picture) {
    return user.value.head_of_family.profile_picture;
  }
  
  // Default profile picture when no profile picture is available
  return defaultProfileImage;
};

const getIdentityNumber = () => {
  if (user.value?.role === 'lurah' && user.value?.identity_number) {
    return user.value.identity_number;
  }
  
  if (user.value?.role === 'head-of-family' && user.value?.head_of_family?.identity_number) {
    return user.value.head_of_family.identity_number;
  }
  
  return null;
};

const getDateOfBirth = () => {
  if (user.value?.role === 'lurah' && user.value?.date_of_birth) {
    return user.value.date_of_birth;
  }
  
  if (user.value?.role === 'head-of-family' && user.value?.head_of_family?.date_of_birth) {
    return user.value.head_of_family.date_of_birth;
  }
  
  return null;
};
</script>

<template>
  <div id="Top-Bar" class="relative flex h-[116px] shrink-0">
    <div
      class="fixed top-0 flex items-center h-[116px] py-[30px] px-6 gap-4 bg-white z-20 border-l border-desa-background transition-all duration-300"
      :style="{ 
        left: isOpen ? '280px' : '0',
        right: '0'
      }"
    >
      <!-- Toggle Sidebar Button - Always Visible -->
      <button
        @click="toggle"
        class="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-desa-background hover:border-desa-dark-green hover:bg-desa-dark-green/5 transition-all duration-300"
      >
        <img
          src="@/assets/images/icons/menu-secondary-green.svg"
          class="size-6"
          alt="toggle menu"
        />
      </button>

      <!-- Search Form -->
      <form @submit="handleSearch" class="flex flex-1 min-w-0">
        <label
          class="group flex w-full max-w-md items-center rounded-full border border-desa-background py-4 px-6 gap-2 bg-white hover:border-desa-dark-green focus-within:border-desa-dark-green transition-setup"
        >
          <button type="submit" class="relative flex size-6 shrink-0">
            <img
              src="@/assets/images/icons/search-normal-dark-green.svg"
              class="absolute flex size-6 shrink-0 opacity-0 group-focus-within:opacity-100 transition-setup"
              alt="icon"
            />
            <img
              src="@/assets/images/icons/search-normal-secondary-green.svg"
              class="absolute flex size-6 shrink-0 opacity-100 group-focus-within:opacity-0 transition-setup"
              alt="icon"
            />
          </button>
          <input
            v-model="searchQuery"
            type="text"
            class="w-full appearance-none outline-none font-medium leading-5 text-desa-black placeholder:placeholder-shown:text-desa-secondary"
            placeholder="Cari nama penduduk, pengajuan, events, dll"
          />
        </label>
      </form>
      
      <!-- Notification Dropdown -->
      <NotificationDropdown />
      
      <!-- User Profile Section - Always visible on desktop -->
      <div class="flex items-center gap-4">
        <div
          class="flex size-14 shrink-0 rounded-full overflow-hidden bg-desa-foreshadow"
        >
          <img
            :src="getProfilePicture()"
            class="w-full h-full object-cover"
            alt="photo"
          />
        </div>
        <div class="flex flex-col gap-[6px] w-[160px] shrink-0">
          <p class="font-semibold leading-5 w-[160px] truncate">{{ user?.name }}</p>
        </div>
        <button @click="handleLogout" class="flex size-6 shrink-0 cursor-pointer">
          <img src="@/assets/images/icons/logout-red.svg" class="size-6" alt="logout" />
        </button>
      </div>
    </div>
  </div>
</template>