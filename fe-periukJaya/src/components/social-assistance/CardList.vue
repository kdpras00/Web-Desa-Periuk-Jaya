<script setup>
import { formatRupiah } from "@/helpers/format";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

defineProps({
  item: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div 
    class="card flex flex-col gap-6 rounded-3xl p-6 bg-white transition-all duration-300"
    :class="{ 'opacity-75 border-2 border-desa-red/20': !item.is_available }"
  >
    <div class="flex items-center w-full">
      <div
        class="flex w-[100px] h-20 shrink-0 rounded-2xl overflow-hidden bg-desa-foreshadow relative"
      >
        <img :src="item.thumbnail" class="w-full h-full object-cover" alt="photo" />
        <!-- Badge Tidak Tersedia pada Thumbnail -->
        <div 
          v-if="!item.is_available"
          class="absolute inset-0 bg-black/50 flex items-center justify-center"
        >
          <span class="text-white text-xs font-bold">TUTUP</span>
        </div>
      </div>
      <div class="flex flex-col gap-[6px] w-full ml-4 mr-9">
        <p class="font-semibold text-lg leading-[22.5px] line-clamp-1">
          {{ item.name }}
        </p>
        <p class="flex items-center gap-1">
          <img
            src="@/assets/images/icons/profile-secondary-green.svg"
            class="flex size-[18px] shrink-0"
            alt="icon"
          />
          <span class="font-medium text-sm text-desa-secondary">{{ item.provider }}</span>
        </p>
      </div>
      <!-- Tombol untuk Lurah - selalu bisa manage -->
      <RouterLink
        v-if="user?.role === 'lurah'"
        :to="{ name: 'manage-social-assistance', params: { id: item.id } }"
        class="flex items-center shrink-0 gap-[10px] rounded-2xl py-4 px-6 bg-desa-black hover:bg-desa-black/90 transition-colors"
      >
        <span class="font-medium text-white">Manage</span>
      </RouterLink>

      <!-- Tombol untuk User Biasa - tergantung status ketersediaan -->
      <template v-else>
        <!-- Jika Tersedia -->
        <RouterLink
          v-if="item.is_available"
          :to="{ name: 'manage-social-assistance', params: { id: item.id } }"
          class="flex items-center shrink-0 gap-[10px] rounded-2xl py-4 px-6 bg-desa-dark-green hover:bg-desa-dark-green/90 transition-colors"
        >
          <span class="font-medium text-white">View Details</span>
        </RouterLink>

        <!-- Jika Tidak Tersedia -->
        <button
          v-else
          disabled
          class="flex items-center shrink-0 gap-[10px] rounded-2xl py-4 px-6 bg-gray-400 cursor-not-allowed opacity-60"
          title="Bantuan sosial ini sudah tidak tersedia"
        >
          <span class="font-medium text-white">Tidak Tersedia</span>
        </button>
      </template>
    </div>
    <hr class="border-desa-background" />
    <div class="grid grid-cols-3 gap-3">
      <div class="flex items-center gap-3">
        <div
          class="flex size-[52px] rounded-2xl items-center justify-center bg-desa-foreshadow overflow-hidden"
        >
          <img
            src="@/assets/images/icons/money-dark-green.svg"
            class="flex size-6 shrink-0"
            alt="icon"
            v-if="item.category === 'cash'"
          />
          <img
            src="@/assets/images/icons/gas-station-secondary-green.svg"
            class="flex size-6 shrink-0"
            alt="icon"
            v-if="item.category === 'subsidized fuel'"
          />

          <img
            src="@/assets/images/icons/health-secondary-green.svg"
            class="flex size-6 shrink-0"
            alt="icon"
            v-if="item.category === 'health'"
          />
          <img
            src="@/assets/images/icons/staple.png"
            class="flex size-6 shrink-0"
            alt="icon"
            v-if="item.category === 'staple'"
          />
        </div>
        <div class="flex flex-col gap-1">
          <p class="font-semibold text-lg leading-5 text-desa-dark-green">
            Rp.{{ formatRupiah(item.amount) }}
          </p>
          <p class="font-medium text-sm text-desa-secondary">
            {{ item.category }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div
          class="flex size-[52px] rounded-2xl items-center justify-center bg-desa-blue/10 overflow-hidden"
        >
          <img
            src="@/assets/images/icons/profile-2user-blue.svg"
            class="flex size-6 shrink-0"
            alt="icon"
          />
        </div>
        <div class="flex flex-col gap-1">
          <p class="font-semibold text-lg leading-5 text-desa-blue">
            {{ item.social_assistance_recipients?.length }} Warga
          </p>
          <p class="font-medium text-sm text-desa-secondary">Total Pengajuan</p>
        </div>
      </div>

      <div class="flex items-center gap-3" v-if="!item.is_available">
        <div
          class="flex size-[52px] rounded-2xl items-center justify-center bg-desa-red/10 overflow-hidden"
        >
          <img
            src="@/assets/images/icons/minus-square-red.svg"
            class="flex size-6 shrink-0"
            alt="icon"
          />
        </div>
        <div class="flex flex-col gap-1">
          <p class="font-semibold text-lg leading-5 text-desa-red">Tidak Tersedia</p>
          <p class="font-medium text-sm text-desa-secondary">Status Bansos</p>
        </div>
      </div>

      <div class="flex items-center gap-3" v-if="item.is_available">
        <div
          class="flex size-[52px] rounded-2xl items-center justify-center bg-desa-foreshadow overflow-hidden"
        >
          <img
            src="@/assets/images/icons/tick-square-dark-green.svg"
            class="flex size-6 shrink-0"
            alt="icon"
          />
        </div>
        <div class="flex flex-col gap-1">
          <p class="font-semibold text-lg leading-5 text-desa-dark-green">Tersedia</p>
          <p class="font-medium text-sm text-desa-secondary">Status Bansos</p>
        </div>
      </div>
    </div>
  </div>
</template>
