<script setup>
import { formatRupiah, formatToClientTimeZone } from "@/helpers/format";
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
  <div class="card flex flex-col gap-4 rounded-3xl p-6 bg-white overflow-hidden">
    <div class="flex items-center justify-between">
      <p class="flex items-center gap-1">
        <img
          src="@/assets/images/icons/calendar-2-secondary-green.svg"
          class="flex size-[18px] shrink-0"
          alt="icon"
        />
        <span class="font-medium text-sm text-desa-secondary">{{
          formatToClientTimeZone(item.created_at)
        }}</span>
      </p>
      <div
        class="badge rounded-full p-3 gap-2 flex w-[100px] justify-center shrink-0 bg-desa-yellow"
        v-if="item.status === 'pending'"
      >
        <span class="font-semibold text-xs text-white uppercase">Menunggu</span>
      </div>

      <div
        class="badge rounded-full p-3 gap-2 flex w-[100px] justify-center shrink-0 bg-desa-green"
        v-if="item.status === 'approved'"
      >
        <span class="font-semibold text-xs text-white uppercase">Disetujui</span>
      </div>

      <div
        class="badge rounded-full p-3 gap-2 flex w-[100px] justify-center shrink-0 bg-desa-red"
        v-if="item.status === 'rejected'"
      >
        <span class="font-semibold text-xs text-white uppercase">Ditolak</span>
      </div>
    </div>
    <hr class="border-desa-background" />
    <div class="flex items-center w-full gap-3 flex-wrap">
      <div
        class="flex w-[100px] h-20 shrink-0 rounded-2xl overflow-hidden bg-desa-foreshadow"
      >
        <img
          :src="item.social_assistance?.thumbnail || '@/assets/images/thumbnails/bantuan_uang.jpg'"
          class="w-full h-full object-cover"
          alt="photo"
        />
      </div>
      <div class="flex flex-col gap-[6px] flex-1 min-w-0 max-w-[400px]">
        <p class="font-semibold text-lg leading-[22.5px] line-clamp-1">
          {{ item.social_assistance?.name }}
        </p>
        <p class="flex items-center gap-1 min-w-0">
          <img
            src="@/assets/images/icons/profile-secondary-green.svg"
            class="flex size-[18px] shrink-0"
            alt="icon"
          />
          <span class="font-medium text-sm text-desa-secondary truncate">{{
            item.social_assistance?.provider
          }}</span>
        </p>
      </div>
      <div class="flex items-center gap-3 shrink-0 min-w-fit">
        <div class="flex flex-col gap-1 text-right">
          <p class="font-semibold text-lg leading-5 text-desa-dark-green">
            {{ formatRupiah(item.social_assistance?.amount) }}
          </p>
          <p class="font-medium text-sm text-desa-secondary">Uang Tunai</p>
        </div>
        <div
          class="flex size-[52px] rounded-2xl items-center justify-center bg-desa-foreshadow overflow-hidden shrink-0"
        >
          <img
            src="@/assets/images/icons/money-dark-green.svg"
            class="flex size-6 shrink-0"
            alt="icon"
          />
        </div>
      </div>
    </div>
    <hr class="border-desa-background" />
    <div class="flex items-center gap-6 justify-between flex-wrap">
      <div class="flex items-center gap-3 min-w-0 flex-1 max-w-[350px]">
        <div class="flex size-[54px] rounded-full bg-desa-foreshadow overflow-hidden shrink-0">
          <img
            :src="item.head_of_family?.profile_picture"
            class="w-full h-full object-cover"
            alt="icon"
          />
        </div>
        <div class="flex flex-col gap-1 min-w-0 flex-1">
          <p class="font-semibold text-lg leading-5 text-desa-black truncate">
            {{ item.head_of_family?.user?.name }}
          </p>
          <p class="flex items-center gap-1 min-w-0">
            <img
              src="@/assets/images/icons/briefcase-secondary-green.svg"
              class="flex size-[18px] shrink-0"
              alt="icon"
            />
            <span class="font-medium text-sm text-desa-secondary truncate">{{
              item.head_of_family?.occupation
            }}</span>
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3 min-w-0 flex-1 max-w-[280px]">
        <div
          class="flex size-[52px] rounded-2xl items-center justify-center bg-desa-foreshadow overflow-hidden shrink-0"
        >
          <img
            src="@/assets/images/icons/receive-square-2-dark-green.svg"
            class="flex size-6 shrink-0"
            alt="icon"
          />
        </div>
        <div class="flex flex-col gap-1 min-w-0">
          <p class="font-semibold text-lg leading-5 text-desa-dark-green truncate">
            {{ formatRupiah(item.amount) }}
          </p>
          <p class="font-medium text-sm text-desa-secondary">Nominal Pengajuan</p>
        </div>
      </div>
      <div class="flex items-center gap-3 justify-end shrink-0">
        <RouterLink
          :to="{
            name: 'manage-social-assistance-recipient',
            params: { id: item.id },
          }"
          href="kd-pengajuan-bansos-manage.html"
          class="flex items-center shrink-0 gap-[10px] rounded-2xl py-4 px-6 bg-desa-black"
        >
          <span class="font-medium text-white whitespace-nowrap" v-if="user?.role === 'lurah'">Manage</span>
          <span class="font-medium text-white whitespace-nowrap" v-else>View Details</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
