<script setup>
import { storeToRefs } from 'pinia'
import { useSearchStore } from '@/stores/search'
import { ref, computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { formatRupiah, formatToClientTimeZone } from '@/helpers/format'

const route = useRoute()
const searchStore = useSearchStore()
const { query, results, loading, activeTab } = storeToRefs(searchStore)
const { setActiveTab } = searchStore

// Get search query from route
const searchQuery = ref(route.query.q || '')

// Perform search when query changes
watch(
  () => route.query.q,
  (newQuery) => {
    if (newQuery) {
      searchQuery.value = newQuery
      searchStore.search(newQuery)
    }
  },
  { immediate: true }
)

// Tab configuration
const tabs = [
  { key: 'headOfFamilies', label: 'Kepala Rumah' },
  { key: 'socialAssistances', label: 'List Bansos' },
  { key: 'socialAssistanceRecipients', label: 'Pengajuan Bansos' },
  { key: 'jobVacancies', label: 'Job Vacancy' },
  { key: 'events', label: 'Event Desa' },
]

// Computed counts
const tabCounts = computed(() => ({
  headOfFamilies: results.value.headOfFamilies?.length || 0,
  socialAssistances: results.value.socialAssistances?.length || 0,
  socialAssistanceRecipients: results.value.socialAssistanceRecipients?.length || 0,
  jobVacancies: results.value.jobVacancies?.length || 0,
  events: results.value.events?.length || 0,
}))

const currentResults = computed(() => results.value[activeTab.value] || [])
</script>

<template>
  <div id="Content" class="relative flex flex-col flex-1 gap-6 w-full shrink-0">
    <div id="Header" class="flex flex-col gap-6">
      <h1 class="font-bold text-[32px] leading-10">
        Search Result: <span id="Keyword">{{ searchQuery }}</span>
      </h1>
      
      <!-- Tabs -->
      <div id="Tabs-Button" class="grid grid-cols-5 gap-0.5 p-1 rounded-2xl bg-white">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="setActiveTab(tab.key)"
          class="tab-btn group"
          :class="{ active: activeTab === tab.key }"
        >
          <div
            class="flex h-12 items-center justify-center rounded-xl bg-desa-foreshadow group-hover:bg-desa-dark-green group-[.active]:bg-desa-dark-green transition-all"
          >
            <span
              class="font-medium leading-5 text-desa-secondary group-hover:text-white group-[.active]:text-white transition-all"
            >
              {{ tab.label }}
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <p class="font-medium text-desa-secondary">Mencari...</p>
    </div>

    <!-- Results -->
    <div v-else id="Tabs-Content" class="flex flex-col flex-1">
      <!-- Kepala Rumah Results -->
      <div v-show="activeTab === 'headOfFamilies'" class="flex flex-1 flex-col gap-6">
        <p class="font-semibold text-2xl">
          Result based on your search ({{ tabCounts.headOfFamilies }})
        </p>
        <div v-if="results.headOfFamilies?.length > 0" class="result flex flex-1 flex-col gap-[14px]">
          <section id="List-Kepala-Rumah" class="flex flex-1 flex-col gap-[14px]">
            <div
              v-for="headOfFamily in results.headOfFamilies"
              :key="headOfFamily.id"
              class="card flex items-center justify-between rounded-3xl p-6 bg-white"
            >
              <div class="flex items-center gap-3 w-[260px]">
                <div class="flex size-16 shrink-0 rounded-full overflow-hidden bg-desa-foreshadow">
                  <img
                    :src="headOfFamily.profile_picture || '/src/assets/images/photos/kk-photo-1.png'"
                    class="w-full h-full object-cover"
                    alt="photo"
                  />
                </div>
                <div class="flex flex-col gap-[6px]">
                  <p class="font-semibold text-lg leading-[22.5px] w-[184px] truncate">
                    {{ headOfFamily.name }}
                  </p>
                  <p class="flex items-center gap-1">
                    <img
                      src="@/assets/images/icons/briefcase-secondary-green.svg"
                      class="flex size-[18px] shrink-0"
                      alt="icon"
                    />
                    <span class="font-medium text-sm text-desa-secondary">{{
                      headOfFamily.occupation || '-'
                    }}</span>
                  </p>
                </div>
              </div>
              <div class="flex flex-col gap-1 w-[180px] shrink-0">
                <p class="flex items-center gap-1">
                  <img
                    src="@/assets/images/icons/keyboard-secondary-green.svg"
                    class="flex size-[18px] shrink-0"
                    alt="icon"
                  />
                  <span class="font-medium text-sm text-desa-secondary">NIK</span>
                </p>
                <p class="font-semibold leading-5">{{ headOfFamily.identity_number }}</p>
              </div>
              <p
                class="flex items-center rounded-full w-[224px] shrink-0 py-[14px] px-4 gap-1 bg-desa-blue/10"
              >
                <img
                  src="@/assets/images/icons/profile-2user-blue.svg"
                  class="flex size-[18px] shrink-0"
                  alt="icon"
                />
                <span class="font-medium text-desa-blue">
                  {{ headOfFamily.family_members_count || 0 }} Anggota Keluarga
                </span>
              </p>
              <RouterLink
                :to="{ name: 'manage-head-of-family', params: { id: headOfFamily.id } }"
                class="flex items-center shrink-0 gap-[10px] rounded-2xl py-4 px-6 bg-desa-black hover:bg-desa-dark-green transition-colors"
              >
                <span class="font-medium text-white">Manage</span>
              </RouterLink>
            </div>
          </section>
        </div>
        <div v-else class="empty-result flex flex-col items-center justify-center m-auto gap-6 py-20">
          <img
            src="@/assets/images/icons/empty-secondary-green.svg"
            class="flex size-[52px] shrink-0"
            alt="icon"
          />
          <p class="font-medium leading-5 text-desa-secondary">Pencarian tidak ditemukan</p>
        </div>
      </div>

      <!-- Social Assistance List Results -->
      <div v-show="activeTab === 'socialAssistances'" class="flex flex-1 flex-col gap-6">
        <p class="font-semibold text-2xl">
          Result based on your search ({{ tabCounts.socialAssistances }})
        </p>
        <div
          v-if="results.socialAssistances?.length > 0"
          class="result flex flex-1 flex-col gap-[14px]"
        >
          <section id="List-Bantuan-Sosial" class="flex flex-1 flex-col gap-[14px]">
            <div
              v-for="assistance in results.socialAssistances"
              :key="assistance.id"
              class="card flex flex-col gap-6 rounded-3xl p-6 bg-white"
            >
              <div class="flex items-center w-full">
                <div
                  class="flex w-[100px] h-20 shrink-0 rounded-2xl overflow-hidden bg-desa-foreshadow"
                >
                  <img
                    :src="assistance.thumbnail || '/src/assets/images/thumbnails/kk-bansos-1.png'"
                    class="w-full h-full object-cover"
                    alt="photo"
                  />
                </div>
                <div class="flex flex-col gap-[6px] w-full ml-4 mr-9">
                  <p class="font-semibold text-lg leading-[22.5px] line-clamp-1">
                    {{ assistance.name }}
                  </p>
                  <p class="flex items-center gap-1">
                    <img
                      src="@/assets/images/icons/profile-secondary-green.svg"
                      class="flex size-[18px] shrink-0"
                      alt="icon"
                    />
                    <span class="font-medium text-sm text-desa-secondary">{{
                      assistance.provider
                    }}</span>
                  </p>
                </div>
                <RouterLink
                  :to="{ name: 'manage-social-assistance', params: { id: assistance.id } }"
                  class="flex items-center shrink-0 gap-[10px] rounded-2xl py-4 px-6 bg-desa-black hover:bg-desa-dark-green transition-colors"
                >
                  <span class="font-medium text-white">Manage</span>
                </RouterLink>
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
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <p class="font-semibold text-lg leading-5 text-desa-dark-green">
                      {{ assistance.category === 'uang' ? `Rp${formatRupiah(assistance.amount)}` : assistance.name }}
                    </p>
                    <p class="font-medium text-sm text-desa-secondary">{{ assistance.category === 'uang' ? 'Uang Tunai' : 'Barang' }}</p>
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
                      {{ assistance.recipients_count || 0 }} Warga
                    </p>
                    <p class="font-medium text-sm text-desa-secondary">Total Pengajuan</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div
                    class="flex size-[52px] rounded-2xl items-center justify-center overflow-hidden"
                    :class="assistance.is_available ? 'bg-desa-dark-green/10' : 'bg-desa-red/10'"
                  >
                    <img
                      :src="assistance.is_available ? '/src/assets/images/icons/tick-square-dark-green.svg' : '/src/assets/images/icons/minus-square-red.svg'"
                      class="flex size-6 shrink-0"
                      alt="icon"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <p
                      class="font-semibold text-lg leading-5"
                      :class="assistance.is_available ? 'text-desa-dark-green' : 'text-desa-red'"
                    >
                      {{ assistance.is_available ? 'Tersedia' : 'Tidak Tersedia' }}
                    </p>
                    <p class="font-medium text-sm text-desa-secondary">Status Bansos</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div v-else class="empty-result flex flex-col items-center justify-center m-auto gap-6 py-20">
          <img
            src="@/assets/images/icons/empty-secondary-green.svg"
            class="flex size-[52px] shrink-0"
            alt="icon"
          />
          <p class="font-medium leading-5 text-desa-secondary">Pencarian tidak ditemukan</p>
        </div>
      </div>

      <!-- Social Assistance Recipients Results -->
      <div v-show="activeTab === 'socialAssistanceRecipients'" class="flex flex-1 flex-col gap-6">
        <p class="font-semibold text-2xl">
          Result based on your search ({{ tabCounts.socialAssistanceRecipients }})
        </p>
        <div
          v-if="results.socialAssistanceRecipients?.length > 0"
          class="result flex flex-1 flex-col gap-[14px]"
        >
          <section id="List-pengajuan-Bansos" class="flex flex-1 flex-col gap-[14px]">
            <div
              v-for="recipient in results.socialAssistanceRecipients"
              :key="recipient.id"
              class="card flex flex-col gap-4 rounded-3xl p-6 bg-white"
            >
              <div class="flex items-center justify-between">
                <p class="flex items-center gap-1">
                  <img
                    src="@/assets/images/icons/calendar-2-secondary-green.svg"
                    class="flex size-[18px] shrink-0"
                    alt="icon"
                  />
                  <span class="font-medium text-sm text-desa-secondary">{{
                    formatToClientTimeZone(recipient.created_at)
                  }}</span>
                </p>
                <div
                  class="badge rounded-full p-3 gap-2 flex w-[100px] justify-center shrink-0"
                  :class="{
                    'bg-desa-yellow': recipient.status === 'pending',
                    'bg-desa-dark-green': recipient.status === 'approved',
                    'bg-desa-red': recipient.status === 'rejected',
                  }"
                >
                  <span class="font-semibold text-xs text-white uppercase">{{
                    recipient.status === 'pending'
                      ? 'Menunggu'
                      : recipient.status === 'approved'
                        ? 'Diterima'
                        : 'Ditolak'
                  }}</span>
                </div>
              </div>
              <hr class="border-desa-background" />
              <div class="flex items-center w-full">
                <div
                  class="flex w-[100px] h-20 shrink-0 rounded-2xl overflow-hidden bg-desa-foreshadow"
                >
                  <img
                    :src="recipient.social_assistance?.thumbnail || '/src/assets/images/thumbnails/kk-bansos-1.png'"
                    class="w-full h-full object-cover"
                    alt="photo"
                  />
                </div>
                <div class="flex flex-col gap-[6px] w-full ml-4 mr-9">
                  <p class="font-semibold text-lg leading-[22.5px] line-clamp-1">
                    {{ recipient.social_assistance?.name }}
                  </p>
                  <p class="flex items-center gap-1">
                    <img
                      src="@/assets/images/icons/profile-secondary-green.svg"
                      class="flex size-[18px] shrink-0"
                      alt="icon"
                    />
                    <span class="font-medium text-sm text-desa-secondary">{{
                      recipient.social_assistance?.provider
                    }}</span>
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <div class="flex flex-col gap-1 text-right">
                    <p class="font-semibold text-lg leading-5 text-desa-dark-green text-nowrap">
                      Rp{{ formatRupiah(recipient.amount) }}
                    </p>
                    <p class="font-medium text-sm text-desa-secondary">
                      {{ recipient.social_assistance?.category === 'uang' ? 'Uang Tunai' : 'Barang' }}
                    </p>
                  </div>
                  <div
                    class="flex size-[52px] rounded-2xl items-center justify-center bg-desa-foreshadow overflow-hidden"
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
              <div class="flex items-center gap-6 justify-between">
                <div class="flex items-center gap-3 w-[302px] shrink-0">
                  <div class="flex size-[54px] rounded-full bg-desa-foreshadow overflow-hidden">
                    <img
                      :src="recipient.head_of_family?.profile_picture || '/src/assets/images/photos/kk-photo-1.png'"
                      class="w-full h-full object-cover"
                      alt="icon"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <p class="font-semibold text-lg leading-5 text-desa-black">
                      {{ recipient.head_of_family?.name || 'Unknown' }}
                    </p>
                    <p class="flex items-center gap-1">
                      <img
                        src="@/assets/images/icons/briefcase-secondary-green.svg"
                        class="flex size-[18px] shrink-0"
                        alt="icon"
                      />
                      <span class="font-medium text-sm text-desa-secondary">{{
                        recipient.head_of_family?.occupation || '-'
                      }}</span>
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-3 w-[302px] shrink-0">
                  <div
                    class="flex size-[52px] rounded-2xl items-center justify-center bg-desa-foreshadow overflow-hidden"
                  >
                    <img
                      src="@/assets/images/icons/receive-square-2-dark-green.svg"
                      class="flex size-6 shrink-0"
                      alt="icon"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <p class="font-semibold text-lg leading-5 text-desa-dark-green text-nowrap">
                      Rp{{ formatRupiah(recipient.amount) }}
                    </p>
                    <p class="font-medium text-sm text-desa-secondary">Nominal Pengajuan</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 justify-end w-[252px] shrink-0">
                  <RouterLink
                    :to="{ name: 'manage-social-assistance-recipient', params: { id: recipient.id } }"
                    class="flex items-center shrink-0 gap-[10px] rounded-2xl py-4 px-6 bg-desa-black hover:bg-desa-dark-green transition-colors"
                  >
                    <span class="font-medium text-white">Manage</span>
                  </RouterLink>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div v-else class="empty-result flex flex-col items-center justify-center m-auto gap-6 py-20">
          <img
            src="@/assets/images/icons/empty-secondary-green.svg"
            class="flex size-[52px] shrink-0"
            alt="icon"
          />
          <p class="font-medium leading-5 text-desa-secondary">Pencarian tidak ditemukan</p>
        </div>
      </div>

      <!-- Job Vacancies Results -->
      <div v-show="activeTab === 'jobVacancies'" class="flex flex-1 flex-col gap-6">
        <p class="font-semibold text-2xl">
          Result based on your search ({{ tabCounts.jobVacancies }})
        </p>
        <div v-if="results.jobVacancies?.length > 0" class="result flex flex-1 flex-col gap-[14px]">
          <section id="List-Job-Vacancies" class="flex flex-1 flex-col gap-[14px]">
            <div
              v-for="job in results.jobVacancies"
              :key="job.id"
              class="card flex flex-col gap-6 rounded-3xl p-6 bg-white"
            >
              <div class="flex items-center w-full">
                <div
                  class="flex w-[100px] h-20 shrink-0 rounded-2xl overflow-hidden bg-desa-foreshadow"
                >
                  <img
                    :src="job.thumbnail || '/src/assets/images/thumbnails/PT Cingluh.jpg'"
                    class="w-full h-full object-cover"
                    alt="photo"
                  />
                </div>
                <div class="flex flex-col gap-[6px] w-full ml-4 mr-9">
                  <p class="font-semibold text-lg leading-[22.5px] line-clamp-1">{{ job.position }}</p>
                  <div class="flex items-center gap-1">
                    <img
                      src="@/assets/images/icons/building-4-secondary-green.svg"
                      class="flex size-[18px] shrink-0"
                      alt="icon"
                    />
                    <p class="font-medium text-sm text-desa-secondary">{{ job.company }}</p>
                  </div>
                </div>
                <RouterLink
                  :to="{ name: 'manage-job-vacancy', params: { id: job.id } }"
                  class="flex items-center shrink-0 gap-[10px] rounded-2xl py-4 px-6 bg-desa-black hover:bg-desa-dark-green transition-colors"
                >
                  <span class="font-medium text-white">Manage</span>
                </RouterLink>
              </div>
              <hr class="border-desa-background" />
              <div class="grid grid-cols-3 gap-3">
                <div class="flex items-center gap-3">
                  <div
                    class="flex size-[52px] rounded-2xl items-center justify-center bg-desa-red/10 overflow-hidden"
                  >
                    <img
                      src="@/assets/images/icons/wallet-3-red.svg"
                      class="flex size-6 shrink-0"
                      alt="icon"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <p class="font-semibold text-lg leading-5 text-desa-red">
                      Rp{{ formatRupiah(job.salary) }}
                    </p>
                    <p class="font-medium text-sm text-desa-secondary">Gaji</p>
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
                      {{ job.applicants_count || 0 }} Pelamar
                    </p>
                    <p class="font-medium text-sm text-desa-secondary">Total Pelamar</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div
                    class="flex size-[52px] rounded-2xl items-center justify-center bg-desa-foreshadow overflow-hidden"
                  >
                    <img
                      src="@/assets/images/icons/calendar-2-dark-green.svg"
                      class="flex size-6 shrink-0"
                      alt="icon"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <p class="font-semibold text-lg leading-5 text-desa-dark-green">
                      {{ formatToClientTimeZone(job.application_deadline) }}
                    </p>
                    <p class="font-medium text-sm text-desa-secondary">Deadline</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div v-else class="empty-result flex flex-col items-center justify-center m-auto gap-6 py-20">
          <img
            src="@/assets/images/icons/empty-secondary-green.svg"
            class="flex size-[52px] shrink-0"
            alt="icon"
          />
          <p class="font-medium leading-5 text-desa-secondary">Pencarian tidak ditemukan</p>
        </div>
      </div>

      <!-- Events Results -->
      <div v-show="activeTab === 'events'" class="flex flex-1 flex-col gap-6">
        <p class="font-semibold text-2xl">Result based on your search ({{ tabCounts.events }})</p>
        <div v-if="results.events?.length > 0" class="result flex flex-1 flex-col gap-[14px]">
          <section id="List-Event-Desa" class="flex flex-1 flex-col gap-[14px]">
            <div
              v-for="event in results.events"
              :key="event.id"
              class="card flex flex-col gap-6 rounded-3xl p-6 bg-white"
            >
              <div class="flex items-center w-full">
                <div
                  class="flex w-[100px] h-20 shrink-0 rounded-2xl overflow-hidden bg-desa-foreshadow"
                >
                  <img
                    :src="event.thumbnail || '/src/assets/images/thumbnails/kk-event-desa-1.png'"
                    class="w-full h-full object-cover"
                    alt="photo"
                  />
                </div>
                <div class="flex flex-col gap-[6px] w-full ml-4 mr-9">
                  <p class="font-semibold text-lg leading-[22.5px] line-clamp-1">{{ event.name }}</p>
                  <div class="flex items-center gap-1">
                    <img
                      src="@/assets/images/icons/ticket-secondary-green.svg"
                      class="flex size-[18px] shrink-0"
                      alt="icon"
                    />
                    <p class="font-medium text-sm text-desa-secondary">
                      Registration:
                      <span class="font-medium text-base text-desa-dark-green">{{
                        event.is_active ? 'Open' : 'Closed'
                      }}</span>
                    </p>
                  </div>
                </div>
                <RouterLink
                  :to="{ name: 'manage-event', params: { id: event.id } }"
                  class="flex items-center shrink-0 gap-[10px] rounded-2xl py-4 px-6 bg-desa-black hover:bg-desa-dark-green transition-colors"
                >
                  <span class="font-medium text-white">Manage</span>
                </RouterLink>
              </div>
              <hr class="border-desa-background" />
              <div class="grid grid-cols-3 gap-3">
                <div class="flex items-center gap-3">
                  <div
                    class="flex size-[52px] rounded-2xl items-center justify-center bg-desa-red/10 overflow-hidden"
                  >
                    <img
                      src="@/assets/images/icons/wallet-3-red.svg"
                      class="flex size-6 shrink-0"
                      alt="icon"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <p class="font-semibold text-lg leading-5 text-desa-red">
                      Rp{{ formatRupiah(event.price) }}
                    </p>
                    <p class="font-medium text-sm text-desa-secondary">Harga Event</p>
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
                      {{ event.participants_count || 0 }} Warga
                    </p>
                    <p class="font-medium text-sm text-desa-secondary">Total Partisipasi</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div
                    class="flex size-[52px] rounded-2xl items-center justify-center bg-desa-foreshadow overflow-hidden"
                  >
                    <img
                      src="@/assets/images/icons/calendar-2-dark-green.svg"
                      class="flex size-6 shrink-0"
                      alt="icon"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <p class="font-semibold text-lg leading-5 text-desa-dark-green">
                      {{ formatToClientTimeZone(event.start_date) }}
                    </p>
                    <p class="font-medium text-sm text-desa-secondary">Tanggal Pelaksanaan</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div v-else class="empty-result flex flex-col items-center justify-center m-auto gap-6 py-20">
          <img
            src="@/assets/images/icons/empty-secondary-green.svg"
            class="flex size-[52px] shrink-0"
            alt="icon"
          />
          <p class="font-medium leading-5 text-desa-secondary">Pencarian tidak ditemukan</p>
        </div>
      </div>
    </div>
  </div>
</template>

