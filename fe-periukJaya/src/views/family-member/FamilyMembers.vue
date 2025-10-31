<script setup>
import { useAuthStore } from '@/stores/auth'
import { useFamilyMemberStore } from '@/stores/familyMember'
import { storeToRefs } from 'pinia'
import { onMounted, ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import Pagination from '@/components/ui/Pagination.vue'

const familyMemberStore = useFamilyMemberStore()
const { familyMembers, meta, loading, success, error } = storeToRefs(familyMemberStore)
const { fetchFamilyMembersPaginated } = familyMemberStore

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

// Filter and pagination state
const searchQuery = ref('')
const filterRelation = ref('all') // all, wife, child
const serverOptions = ref({
  page: 1,
  row_per_page: 10,
})

// Debounce timer
let searchDebounceTimer = null

const setSuccessNull = () => {
  familyMemberStore.success = null
}

const calculateAge = (dateString) => {
  if (!dateString) return 'N/A'
  const today = new Date()
  const birthDate = new Date(dateString)
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

// Fetch data from backend with filters
const fetchData = async () => {
  const params = {
    search: searchQuery.value || undefined,
    relation: filterRelation.value !== 'all' ? filterRelation.value : undefined,
    row_per_page: serverOptions.value.row_per_page,
    page: serverOptions.value.page,
  }

  await fetchFamilyMembersPaginated(params)
}

// Statistics - now fetched from backend meta
const stats = computed(() => {
  return {
    total: (meta.value?.total || 0) + 1, // +1 for head of family
    wife: familyMembers.value.filter((m) => m.relation === 'wife').length,
    child: familyMembers.value.filter((m) => m.relation === 'child').length,
  }
})

// Computed untuk head of family data
const headOfFamilyData = computed(() => {
  if (!user.value) return null

  const hof = user.value.head_of_family

  if (hof && typeof hof === 'object' && !Array.isArray(hof)) {
    return {
      name: user.value.name || 'N/A',
      occupation: hof.occupation || 'N/A',
      identity_number: hof.identity_number || '-',
      date_of_birth: hof.date_of_birth || null,
      profile_picture: hof.profile_picture || user.value.profile_picture || null,
    }
  }

  // Fallback: Data dari user langsung atau N/A
  return {
    name: user.value.name || 'N/A',
    occupation: 'Belum diisi - Silakan lengkapi data',
    identity_number: user.value.identity_number || 'Belum diisi',
    date_of_birth: user.value.date_of_birth || null,
    profile_picture: user.value.profile_picture || null,
  }
})

// Reset to page 1 when filters change
const resetPage = () => {
  serverOptions.value.page = 1
}

// Watch for search query changes with debouncing (realtime search)
watch(searchQuery, (newValue) => {
  // Clear previous timer
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  // Reset to page 1
  resetPage()

  // Set new timer for debounced search (500ms delay)
  searchDebounceTimer = setTimeout(() => {
    fetchData()
  }, 500)
})

// Watch for filter relation changes
watch(filterRelation, () => {
  resetPage()
  fetchData()
})

// Watch for row_per_page changes
watch(
  () => serverOptions.value.row_per_page,
  () => {
    resetPage()
    fetchData()
  },
)

// Watch for page changes
watch(
  () => serverOptions.value.page,
  () => {
    fetchData()
  },
)

onMounted(async () => {
  await fetchData()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <header class="flex items-center justify-between">
      <div>
        <h1 class="font-semibold text-2xl leading-[30px] text-desa-black">Anggota Keluarga</h1>
        <p class="text-sm text-desa-secondary mt-1">Kelola data anggota keluarga Anda</p>
      </div>
      <RouterLink :to="{ name: 'create-family-member' }" class="shrink-0">
        <div
          class="px-6 py-4 rounded-2xl bg-desa-dark-green hover:bg-desa-dark-green/90 transition-all flex items-center gap-[10px]"
        >
          <img
            src="@/assets/images/icons/add-square-white.svg"
            alt="icon"
            class="size-6 shrink-0"
          />
          <p class="font-medium leading-5 text-white">Tambah Anggota</p>
        </div>
      </RouterLink>
    </header>

    <!-- Success Alert -->
    <div
      v-if="success"
      class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-2xl relative"
      role="alert"
    >
      <span class="block sm:inline">{{ success }}</span>
      <button
        type="button"
        @click="setSuccessNull"
        class="absolute top-1/2 -translate-y-1/2 right-4 hover:scale-110 transition-transform"
      >
        <img
          src="@/assets/images/icons/close-circle-white.svg"
          class="flex size-6 shrink-0"
          alt="icon"
        />
      </button>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl p-6 border border-desa-background">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-desa-secondary mb-1">Total Anggota</p>
            <p class="text-3xl font-bold text-desa-black">{{ stats.total }}</p>
          </div>
          <div class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-blue-100">
            <img
              src="@/assets/images/icons/user-search-secondary-green.svg"
              class="size-7"
              alt="icon"
            />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-6 border border-desa-background">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-desa-secondary mb-1">Istri</p>
            <p class="text-3xl font-bold text-pink-500">{{ stats.wife }}</p>
          </div>
          <div class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-pink-100">
            <img
              src="@/assets/images/icons/user-search-secondary-green.svg"
              class="size-7"
              alt="icon"
            />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-6 border border-desa-background">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-desa-secondary mb-1">Anak</p>
            <p class="text-3xl font-bold text-green-500">{{ stats.child }}</p>
          </div>
          <div class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-green-100">
            <img
              src="@/assets/images/icons/user-search-secondary-green.svg"
              class="size-7"
              alt="icon"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Kepala Keluarga Section -->
    <section
      v-if="headOfFamilyData"
      id="Kepala-Keluarga"
      class="flex flex-col gap-6 p-6 bg-white rounded-3xl border border-desa-background"
    >
      <h2 class="font-medium leading-5 text-desa-secondary">Kepala Keluarga (1)</h2>

      <div class="rounded-2xl border border-desa-background p-6">
        <div class="flex items-center gap-6">
          <!-- Photo & Name (Fixed Width - Same as members) -->
          <div class="flex items-center gap-3 w-[280px] shrink-0">
            <div class="flex size-[64px] shrink-0 rounded-full overflow-hidden bg-desa-foreshadow">
              <img
                :src="headOfFamilyData.profile_picture"
                class="w-full h-full object-cover"
                alt="photo"
              />
            </div>
            <div class="flex flex-col gap-[6px] min-w-0 flex-1">
              <h3 class="font-semibold text-lg leading-[22.5px] line-clamp-1">
                {{ headOfFamilyData.name }}
              </h3>
              <div class="flex items-center gap-1">
                <img
                  src="@/assets/images/icons/briefcase-secondary-green.svg"
                  alt="icon"
                  class="size-[18px] shrink-0"
                />
                <p class="font-medium leading-5 text-desa-secondary line-clamp-1">
                  {{ headOfFamilyData.occupation }}
                </p>
              </div>
            </div>
          </div>

          <!-- NIK (Fixed Width - Same as members) -->
          <div class="flex flex-col gap-[6px] w-[180px] shrink-0">
            <div class="flex items-center gap-1">
              <img
                src="@/assets/images/icons/keyboard-secondary-green.svg"
                alt="icon"
                class="size-[18px] shrink-0"
              />
              <h3 class="font-medium leading-[17.5px] text-sm text-desa-secondary">NIK</h3>
            </div>
            <p class="font-semibold leading-5">{{ headOfFamilyData.identity_number }}</p>
          </div>

          <!-- Umur (Fixed Width - Same as members) -->
          <div class="flex flex-col gap-[6px] w-[140px] shrink-0">
            <div class="flex items-center gap-1">
              <img
                src="@/assets/images/icons/timer-secondary-green.svg"
                alt="icon"
                class="size-[18px] shrink-0"
              />
              <h3 class="font-medium leading-[17.5px] text-sm text-desa-secondary">Umur</h3>
            </div>
            <p class="font-semibold leading-5">
              {{
                headOfFamilyData.date_of_birth
                  ? calculateAge(headOfFamilyData.date_of_birth) + ' Tahun'
                  : 'N/A'
              }}
            </p>
          </div>

          <!-- Empty space for Hubungan alignment -->
          <div class="w-[120px] shrink-0"></div>

          <!-- Empty space for button alignment -->
          <div class="flex-1"></div>
        </div>
      </div>
    </section>

    <!-- Family Members List with Filter & Pagination -->
    <section class="flex flex-col gap-6 p-6 bg-white rounded-3xl border border-desa-background">
      <h2 class="font-semibold text-lg text-desa-black">Daftar Anggota Keluarga</h2>

      <!-- Filter & Search -->
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <div class="relative">
            <img
              src="@/assets/images/icons/search-normal-secondary-green.svg"
              class="absolute left-4 top-1/2 -translate-y-1/2 size-5 pointer-events-none z-10"
              alt="search"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama, NIK, atau pekerjaan..."
              class="w-full py-3 pl-12 pr-4 border border-desa-background rounded-xl focus:outline-none focus:border-desa-dark-green transition-colors"
            />
          </div>
        </div>

        <!-- Filter by Relation -->
        <div class="flex gap-2">
          <button
            @click="filterRelation = 'all'"
            class="px-4 py-3 rounded-xl font-medium transition-all text-sm"
            :class="
              filterRelation === 'all'
                ? 'bg-desa-dark-green text-white'
                : 'bg-desa-background text-desa-secondary hover:bg-desa-dark-green/10'
            "
          >
            Semua
          </button>
          <button
            @click="filterRelation = 'wife'"
            class="px-4 py-3 rounded-xl font-medium transition-all text-sm"
            :class="
              filterRelation === 'wife'
                ? 'bg-desa-dark-green text-white'
                : 'bg-desa-background text-desa-secondary hover:bg-desa-dark-green/10'
            "
          >
            Istri
          </button>
          <button
            @click="filterRelation = 'child'"
            class="px-4 py-3 rounded-xl font-medium transition-all text-sm"
            :class="
              filterRelation === 'child'
                ? 'bg-desa-dark-green text-white'
                : 'bg-desa-background text-desa-secondary hover:bg-desa-dark-green/10'
            "
          >
            Anak
          </button>
        </div>

        <!-- Entries per page -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-desa-secondary whitespace-nowrap">Tampilkan:</label>
          <select
            v-model="serverOptions.row_per_page"
            class="px-3 py-3 border border-desa-background rounded-xl focus:outline-none focus:border-desa-dark-green transition-colors text-sm"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-desa-dark-green"></div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="familyMembers.length === 0"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <img
          src="@/assets/images/icons/user-search-secondary-green.svg"
          class="size-20 mb-4 opacity-50"
          alt="icon"
        />
        <p class="text-lg font-semibold text-desa-secondary mb-2">Tidak ada data</p>
        <p class="text-sm text-desa-secondary">
          {{
            searchQuery || filterRelation !== 'all'
              ? 'Tidak ada hasil yang sesuai dengan pencarian'
              : 'Belum ada anggota keluarga yang ditambahkan'
          }}
        </p>
      </div>

      <!-- Family Members Cards (Original Design) -->
      <div v-else class="flex flex-col gap-4">
        <div
          v-for="member in familyMembers"
          :key="member.id"
          class="rounded-2xl border border-desa-background p-6 hover:shadow-md transition-all"
        >
          <div class="flex items-center gap-6">
            <!-- Photo & Name (Fixed Width) -->
            <div class="flex items-center gap-3 w-[280px] shrink-0">
              <div
                class="flex size-[64px] shrink-0 rounded-full overflow-hidden bg-desa-foreshadow"
              >
                <img :src="member.profile_picture" class="w-full h-full object-cover" alt="photo" />
              </div>
              <div class="flex flex-col gap-[6px] min-w-0 flex-1">
                <h3 class="font-semibold text-lg leading-[22.5px] line-clamp-1">
                  {{ member.user?.name || 'N/A' }}
                </h3>
                <div class="flex items-center gap-1">
                  <img
                    src="@/assets/images/icons/briefcase-secondary-green.svg"
                    alt="icon"
                    class="size-[18px] shrink-0"
                  />
                  <p class="font-medium leading-5 text-desa-secondary line-clamp-1">
                    {{ member.occupation || 'N/A' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- NIK (Fixed Width) -->
            <div class="flex flex-col gap-[6px] w-[180px] shrink-0">
              <div class="flex items-center gap-1">
                <img
                  src="@/assets/images/icons/keyboard-secondary-green.svg"
                  alt="icon"
                  class="size-[18px] shrink-0"
                />
                <h3 class="font-medium leading-[17.5px] text-sm text-desa-secondary">NIK</h3>
              </div>
              <p class="font-semibold leading-5">{{ member.identity_number || '-' }}</p>
            </div>

            <!-- Umur (Fixed Width) -->
            <div class="flex flex-col gap-[6px] w-[140px] shrink-0">
              <div class="flex items-center gap-1">
                <img
                  src="@/assets/images/icons/timer-secondary-green.svg"
                  alt="icon"
                  class="size-[18px] shrink-0"
                />
                <h3 class="font-medium leading-[17.5px] text-sm text-desa-secondary">Umur</h3>
              </div>
              <p class="font-semibold leading-5">{{ calculateAge(member.date_of_birth) }} Tahun</p>
            </div>

            <!-- Hubungan (Fixed Width) -->
            <div class="flex flex-col gap-[6px] w-[120px] shrink-0">
              <div class="flex items-center gap-1">
                <img
                  src="@/assets/images/icons/user-search-secondary-green.svg"
                  alt="icon"
                  class="size-[18px] shrink-0"
                />
                <h3 class="font-medium leading-[17.5px] text-sm text-desa-secondary">Hubungan</h3>
              </div>
              <p class="font-semibold leading-5">
                {{ member.relation === 'wife' ? 'Istri' : 'Anak' }}
              </p>
            </div>

            <!-- Action (Auto Width) -->
            <div class="flex-1 flex justify-end">
              <RouterLink
                :to="{ name: 'manage-family-member', params: { id: member.id } }"
                class="shrink-0"
              >
                <div
                  class="rounded-2xl px-6 py-[18px] bg-desa-black hover:bg-desa-black/90 font-medium leading-5 text-white transition-all"
                >
                  Manage
                </div>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="meta.last_page > 1"
        class="flex items-center justify-between pt-4 border-t border-desa-background"
      >
        <p class="text-sm text-desa-secondary">
          Menampilkan {{ (meta.current_page - 1) * meta.per_page + 1 }} -
          {{ Math.min(meta.current_page * meta.per_page, meta.total) }} dari {{ meta.total }} data
        </p>
        <Pagination :meta="meta" :serverOptions="serverOptions" />
      </div>
    </section>
  </div>
</template>
