<script setup>
import CardList from "@/components/social-assistance-recipient/CardList.vue";
import { useSocialAssistanceRecipientStore } from "@/stores/socialAssistanceRecipient";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";
import { debounce } from "lodash";
import Pagination from "@/components/ui/Pagination.vue";
import FilterModal from "@/components/ui/FilterModal.vue";

const socialAssistanceRecipientStore = useSocialAssistanceRecipientStore();
const { socialAssistanceRecipients, meta, loading, error, success } = storeToRefs(
  socialAssistanceRecipientStore
);
const { fetchSocialAssistanceRecipientsPaginated } = socialAssistanceRecipientStore;

const serverOptions = ref({
  page: 1,
  row_per_page: 20,
});

const filters = ref({
  search: null,
  status: null,
  bank: null,
});

const showFilterModal = ref(false);
const activeFiltersCount = ref(0);

// Konfigurasi filter untuk modal
const filterConfig = [
  {
    key: 'status',
    label: 'Status Pengajuan',
    type: 'select',
    options: [
      { value: 'pending', label: 'Menunggu' },
      { value: 'approved', label: 'Disetujui' },
      { value: 'rejected', label: 'Ditolak' },
    ],
  },
  {
    key: 'bank',
    label: 'Bank',
    type: 'select',
    options: [
      { value: 'BRI', label: 'BRI' },
      { value: 'BNI', label: 'BNI' },
      { value: 'Mandiri', label: 'Mandiri' },
      { value: 'BCA', label: 'BCA' },
      { value: 'BSI', label: 'BSI (Bank Syariah Indonesia)' },
      { value: 'BTN', label: 'BTN' },
      { value: 'Lainnya', label: 'Lainnya' },
    ],
  },
];

const fetchData = async () => {
  await fetchSocialAssistanceRecipientsPaginated({
    ...serverOptions.value,
    ...filters.value,
  });
};

const debounceFetchData = debounce(fetchData, 300);

const applyFilters = (newFilters) => {
  filters.value = {
    ...filters.value,
    ...newFilters,
  };
  updateActiveFiltersCount();
};

const resetFilters = (resetValues) => {
  filters.value = {
    search: filters.value.search,
    ...resetValues,
  };
  updateActiveFiltersCount();
};

const updateActiveFiltersCount = () => {
  activeFiltersCount.value = Object.entries(filters.value).filter(
    ([key, value]) => key !== 'search' && value !== null && value !== ''
  ).length;
};

onMounted(() => {
  fetchData();
  updateActiveFiltersCount();
});

// watch digunakan untuk melihat perubahan. jika ada perubahan dia akan melakukan sebuah aksi
watch(
  //<- <- ketika mengubah pagination atau melakukan paginate. akan fetch data
  serverOptions,
  () => {
    fetchData();
  },
  {
    deep: true,
  }
);

// filter
watch(
  //ketika mengubah filter atau melakukan filter. akan fetch data
  filters,
  () => {
    serverOptions.value.page = 1;
    debounceFetchData();
  },
  {
    deep: true,
  }
);
</script>

<template>
  <div id="Header" class="flex items-center justify-between">
    <h1 class="font-semibold text-2xl">Pengajuan Bantuan Sosial</h1>
  </div>
  <section id="List-pengajuan-Bansos" class="flex flex-col gap-[14px] max-w-full overflow-hidden">
    <form id="Page-Search" class="flex items-center justify-between">
      <div class="flex flex-col gap-3 w-[370px] shrink-0">
        <label class="relative group peer w-full valid">
          <input
            v-model="filters.search"
            type="text"
            placeholder="Cari nama Pengajuan bantuan social"
            class="appearance-none outline-none w-full h-14 rounded-2xl ring-[1.5px] ring-desa-background focus:ring-desa-black py-4 pl-12 pr-6 gap-2 font-medium placeholder:text-desa-secondary transition-all duration-300"
          />
          <div
            class="absolute transform -translate-y-1/2 top-1/2 left-4 flex size-6 shrink-0"
          >
            <img
              src="@/assets/images/icons/user-search-secondary-green.svg"
              class="size-6 hidden group-has-[:placeholder-shown]:flex"
              alt="icon"
            />
            <img
              src="@/assets/images/icons/user-search-black.svg"
              class="size-6 flex group-has-[:placeholder-shown]:hidden"
              alt="icon"
            />
          </div>
        </label>
      </div>
      <div class="options flex items-center gap-4">
        <div class="flex items-center gap-[10px]">
          <span class="font-medium leading-5">Show</span>
          <div class="relative">
            <select
              v-model="serverOptions.row_per_page"
              name=""
              id=""
              class="appearance-none outline-none w-full h-14 rounded-2xl ring-[1.5px] ring-desa-background focus:ring-desa-black py-4 px-6 pr-[52px] gap-2 font-medium placeholder:text-desa-secondary transition-all duration-300"
            >
              <option value="5">5 Entries</option>
              <option value="10">10 Entries</option>
              <option value="20" selected>20 Entries</option>
              <option value="30">30 Entries</option>
              <option value="40">40 Entries</option>
              <option value="50">50 Entries</option>
            </select>
            <img
              src="@/assets/images/icons/arrow-down-black.svg"
              class="flex size-6 shrink-0 absolute transform -translate-y-1/2 top-1/2 right-6"
              alt="icon"
            />
          </div>
        </div>
        <button
          type="button"
          @click="showFilterModal = true"
          class="flex items-center gap-1 h-14 w-fit rounded-2xl border border-desa-background bg-white py-4 px-6 hover:bg-desa-background transition-colors relative"
        >
          <img
            src="@/assets/images/icons/filter-black.svg"
            class="flex size-6 shrink-0"
            alt="icon"
          />
          <span class="font-medium leading-5">Filter</span>
          <!-- Badge untuk menunjukkan jumlah filter aktif -->
          <span
            v-if="activeFiltersCount > 0"
            class="absolute -top-2 -right-2 bg-desa-dark-green text-white text-xs font-bold rounded-full size-6 flex items-center justify-center"
          >
            {{ activeFiltersCount }}
          </span>
        </button>
      </div>
    </form>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col gap-4 py-8">
      <div
        v-for="i in serverOptions.row_per_page"
        :key="i"
        class="animate-pulse flex items-center gap-4 p-6 bg-white rounded-2xl border border-desa-background"
      >
        <div class="w-24 h-24 bg-gray-200 rounded-xl"></div>
        <div class="flex-1 space-y-3">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>

    <!-- Data List -->
    <div v-else class="w-full max-w-full overflow-hidden">
      <CardList
        v-for="socialAssistanceRecipient in socialAssistanceRecipients"
        :key="socialAssistanceRecipient.id"
        :item="socialAssistanceRecipient"
      />

      <!-- Empty State -->
      <div
        v-if="socialAssistanceRecipients.length === 0"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <img
          src="@/assets/images/icons/user-search-secondary-green.svg"
          class="size-16 mb-4 opacity-50"
          alt="icon"
        />
        <p class="text-lg font-medium text-desa-secondary">
          Tidak ada data pengajuan bantuan sosial
        </p>
        <p class="text-sm text-desa-secondary mt-2">
          {{ filters.search ? 'Coba dengan kata kunci lain' : 'Belum ada pengajuan saat ini' }}
        </p>
      </div>
    </div>

    <Pagination :meta="meta" :serverOptions="serverOptions" v-if="!loading" />
  </section>

  <!-- Filter Modal -->
  <FilterModal
    v-model="showFilterModal"
    :filters="filters"
    :filterConfig="filterConfig"
    @apply="applyFilters"
    @reset="resetFilters"
  />
</template>
