<script setup>
import ModalDelete from '@/components/ui/ModalDelete.vue'
import { formatRupiah, formatToClientTimeZone } from '@/helpers/format'
import { useDeleteConfirmation } from '@/composables/useFormHelpers'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useFamilyMemberStore } from '@/stores/familyMember'
import { useJobVacancyStore } from '@/stores/jobVacancy'
import { useJobVacancyApplicantStore } from '@/stores/jobApplicant'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { confirmDelete, showSuccess, showError } = useDeleteConfirmation()

// Get the 'from' query parameter to determine page context
const fromPage = computed(() => route.query.from || null)

const jobVacancy = ref({})
const jobApplicant = ref({
  job_vacancy_id: null,
  user_id: null,
})
const jobVacancyStore = useJobVacancyStore()
const { loading, error, success } = storeToRefs(jobVacancyStore)
const { fetchJobVacancy, deleteJobVacancy } = jobVacancyStore

// Create a separate store instance for job applicant operations
const jobApplicantStore = useJobVacancyStore()
const { updateJobVacancy } = jobApplicantStore

const jobVacancyApplicantStore = useJobVacancyApplicantStore()
const { loading: applicantLoading } = storeToRefs(jobVacancyApplicantStore)
const { createJobVacancyApplicant } = jobVacancyApplicantStore

const familyMemberStore = useFamilyMemberStore()
const { familyMembers } = storeToRefs(familyMemberStore)
const { fetchFamilyMembers } = familyMemberStore

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

// Add reactive variable for filtering applicants
const activeTab = ref('all')

const setSuccessNull = () => {
  jobVacancyStore.success = null
}

const setErrorNull = () => {
  jobVacancyStore.error = null
}

const fetchData = async () => {
  const response = await fetchJobVacancy(route.params.id)

  jobVacancy.value = response
  jobApplicant.value.job_vacancy_id = response.id
  jobVacancy.value.day = Math.round(
    (new Date(jobVacancy.value.end_date).getTime() -
      new Date(jobVacancy.value.start_date).getTime()) /
      (24 * 60 * 60 * 1000),
  )
}

// Availability based on job_status
const isAvailable = computed(() => jobVacancy.value?.job_status === 'open')

// Determine if current user or their family already applied
const familyUserIds = computed(() => {
  const ids = []
  if (user.value?.id) ids.push(user.value.id)
  if (Array.isArray(familyMembers.value)) {
    for (const member of familyMembers.value) {
      const uid = member?.user_id || member?.user?.id
      if (uid) ids.push(uid)
    }
  }
  return ids
})

const applicantUserIds = computed(() => {
  if (!Array.isArray(jobVacancy.value?.job_applicants)) return []
  return jobVacancy.value.job_applicants.map((a) => a.user_id || a.user?.id).filter(Boolean)
})

const hasApplied = computed(() => {
  const appliedSet = new Set(applicantUserIds.value)
  for (const id of familyUserIds.value) {
    if (appliedSet.has(id)) return true
  }
  return false
})

// Identify which member applied (current user or one of the family members)
const matchedApplicant = computed(() => {
  if (!Array.isArray(jobVacancy.value?.job_applicants)) return null
  const ids = new Set(familyUserIds.value)
  const familyApps = jobVacancy.value.job_applicants.filter((a) => {
    const uid = a.user_id || a.user?.id
    return uid && ids.has(uid)
  })
  if (familyApps.length === 0) return null
  // pick the most recent application among family members
  return familyApps.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
})

const matchedOccupation = computed(() => {
  const uid = matchedApplicant.value?.user_id || matchedApplicant.value?.user?.id
  if (!uid) return null
  // Try occupation from applicant.user
  const occFromApplicant =
    matchedApplicant.value?.user?.occupation ||
    matchedApplicant.value?.user?.head_of_family?.occupation
  if (occFromApplicant) return occFromApplicant
  // If matches current user, use head_of_family occupation
  if (uid === user.value?.id) return user.value?.head_of_family?.occupation || null
  // Try find in familyMembers by user_id
  const member = Array.isArray(familyMembers.value)
    ? familyMembers.value.find((m) => m.user_id === uid)
    : null
  return member?.occupation || null
})

// Computed to determine if user is coming from "my-applications" page
const isFromMyApplications = computed(() => fromPage.value === 'my-applications')

// Function to filter applicants based on active tab
const filteredApplicants = computed(() => {
  if (!jobVacancy.value.job_applicants) return []

  switch (activeTab.value) {
    case 'pending':
      return jobVacancy.value.job_applicants.filter((applicant) => applicant.status === 'pending')
    case 'approved':
      return jobVacancy.value.job_applicants.filter((applicant) => applicant.status === 'approved')
    case 'rejected':
      return jobVacancy.value.job_applicants.filter((applicant) => applicant.status === 'rejected')
    default: // 'all'
      return jobVacancy.value.job_applicants
  }
})
const showModalDelete = ref(false)

const showSelectApplicant = ref(false)
const selectedApplicantId = ref(null)

async function handleDelete() {
  const confirmed = await confirmDelete({
    title: 'Hapus Lowongan Pekerjaan?',
    text: 'Data lowongan pekerjaan akan dihapus secara permanen.',
  })

  if (!confirmed) return

  try {
    await deleteJobVacancy(route.params.id)
    await showSuccess('Lowongan pekerjaan berhasil dihapus')
    router.push({ name: 'job-vacancy' })
  } catch (error) {
    await showError(error.message || 'Gagal menghapus lowongan pekerjaan')
  }
}

async function handleSubmit(selectedUserId = null) {
  try {
    const userId = selectedUserId || selectedApplicantId.value
    if (!userId) {
      console.error('No user selected')
      return
    }

    const payload = {
      job_vacancy_id: jobVacancy.value.id,
      user_id: userId,
    }
    await createJobVacancyApplicant(payload)
    showSelectApplicant.value = false
    selectedApplicantId.value = null
    // Refresh the job vacancy data to show updated applicants
    await fetchData()
    await showSuccess('Lamaran berhasil dikirim!')
  } catch (error) {
    console.error('Error submitting application:', error)
    await showError(error?.message || 'Gagal mengirim lamaran')
  }
}

async function handleModalSubmit() {
  if (!selectedApplicantId.value) {
    alert('Silakan pilih salah satu anggota keluarga')
    return
  }
  await handleSubmit()
}

// Function to handle applicant approval
async function handleApprove(applicantId) {
  try {
    // Update the applicant status to approved
    const updatedApplicant = await jobVacancyStore.updateJobApplicantStatus(applicantId, 'approved')

    // Update the local data to reflect the change without a full refresh
    const applicantIndex = jobVacancy.value.job_applicants.findIndex(
      (app) => app.id === applicantId,
    )
    if (applicantIndex !== -1) {
      jobVacancy.value.job_applicants[applicantIndex].status = 'approved'
    }

    // Show success message
    jobVacancyStore.success = 'Applicant approved successfully'
    setTimeout(() => {
      jobVacancyStore.success = null
    }, 3000)
  } catch (error) {
    console.error('Error approving applicant:', error)
  }
}

// Function to handle applicant rejection
async function handleReject(applicantId) {
  try {
    // Update the applicant status to rejected
    const updatedApplicant = await jobVacancyStore.updateJobApplicantStatus(applicantId, 'rejected')

    // Update the local data to reflect the change without a full refresh
    const applicantIndex = jobVacancy.value.job_applicants.findIndex(
      (app) => app.id === applicantId,
    )
    if (applicantIndex !== -1) {
      jobVacancy.value.job_applicants[applicantIndex].status = 'rejected'
    }

    // Show success message
    jobVacancyStore.success = 'Applicant rejected successfully'
    setTimeout(() => {
      jobVacancyStore.success = null
    }, 3000)
  } catch (error) {
    console.error('Error rejecting applicant:', error)
  }
}

const calculateAge = (dateString) => {
  const today = new Date()
  const birthDate = new Date(dateString)
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

watch(
  user,
  (newUser) => {
    if (newUser?.role === 'head-of-family') {
      fetchFamilyMembers()
    }
  },
  { immediate: true },
)

onMounted(fetchData)
</script>

<template>
  <div id="Header" class="flex items-center justify-between">
    <div class="flex flex-col gap-2">
      <div class="flex gap-1 items-center leading-5 text-desa-secondary">
        <p class="last-of-type:text-desa-dark-green last-of-type:font-semibold capitalize">
          Job Vacancy
        </p>
        <span>/</span>
        <p class="last-of-type:text-desa-dark-green last-of-type:font-semibold capitalize">
          Manage
        </p>
      </div>
      <h1 class="font-semibold text-2xl">Detail Job Vacancy</h1>
    </div>
    <div class="flex items-center gap-3" v-if="user?.role === 'lurah'">
      <button
        @click="showModalDelete = true"
        data-modal="Modal-Delete"
        class="flex items-center rounded-2xl py-4 px-6 gap-[10px] bg-desa-red"
      >
        <p class="font-medium text-white">Hapus Data</p>
        <img src="@/assets/images/icons/trash-white.svg" class="flex size-6 shrink-0" alt="icon" />
      </button>
      <RouterLink
        :to="{ name: 'edit-job-vacancy', params: { id: jobVacancy.id } }"
        class="flex items-center rounded-2xl py-4 px-6 gap-[10px] bg-desa-black"
      >
        <p class="font-medium text-white">Ubah Data</p>
        <img src="@/assets/images/icons/edit-white.svg" class="flex size-6 shrink-0" alt="icon" />
      </RouterLink>
    </div>
  </div>

  <div
    v-if="success"
    class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-2xl relative mb-4"
    role="alert"
  >
    <span class="block sm:inline">{{ success }}</span>

    <button type="button" @click="setSuccessNull" class="absolute top-1/2 -translate-y-1/2 right-4">
      <img
        src="@/assets/images/icons/close-circle-white.svg"
        class="flex size-6 shrink-0"
        alt="icon"
      />
    </button>
  </div>

  <div
    v-if="error"
    class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl relative mb-4"
    role="alert"
  >
    <span class="block sm:inline">{{ error }}</span>

    <button type="button" @click="setErrorNull" class="absolute top-1/2 -translate-y-1/2 right-4">
      <img
        src="@/assets/images/icons/close-circle-white.svg"
        class="flex size-6 shrink-0"
        alt="icon"
      />
    </button>
  </div>
  <div class="flex flex-col gap-[14px]" v-if="user?.role === 'lurah'">
    <section id="Informasi" class="flex flex-col rounded-3xl p-6 gap-6 bg-white">
      <p class="font-medium leading-5 text-desa-secondary">Informasi Job</p>
      <div class="flex items-center justify-between">
        <div
          class="flex w-[120px] h-[100px] shrink-0 rounded-2xl overflow-hidden bg-desa-foreshadow"
        >
          <img :src="jobVacancy.thumbnail" class="w-full h-full object-cover" alt="photo" />
        </div>
        <div
          class="badge rounded-full p-3 gap-2 flex justify-center shrink-0 bg-desa-dark-green"
          v-if="isAvailable"
        >
          <span class="font-semibold text-xs text-white uppercase">Tersedia</span>
        </div>
        <div class="badge rounded-full p-3 gap-2 flex justify-center shrink-0 bg-desa-red" v-else>
          <span class="font-semibold text-xs text-white uppercase">Tidak Tersedia</span>
        </div>
      </div>
      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-semibold text-lg leading-[22.5px] line-clamp-1">
          {{ jobVacancy.job_title }}
        </p>
        <p class="font-medium text-sm text-desa-secondary">
          Penanggung Jawab:
          <span class="font-medium text-base text-desa-dark-green">
            {{ jobVacancy.company_in_charge }}
          </span>
        </p>
      </div>
      <hr class="border-desa-foreshadow" />
      <div class="flex items-center justify-between">
        <div class="flex items-center w-full gap-3">
          <div
            class="flex size-[52px] shrink-0 rounded-2xl bg-desa-red/10 items-center justify-center"
          >
            <img
              src="@/assets/images/icons/wallet-3-red.svg"
              class="flex size-6 shrink-0"
              alt="icon"
            />
          </div>
          <div class="flex flex-col gap-1 w-full">
            <p class="font-semibold text-xl leading-[22.5px] text-desa-red">
              Rp{{ formatRupiah(jobVacancy.salary) }}
            </p>
            <span class="font-medium text-desa-secondary"> Salary </span>
          </div>
        </div>
        <div
          class="badge rounded-full p-3 gap-2 flex w-[100px] justify-center shrink-0"
          :class="isAvailable ? 'bg-desa-dark-green' : 'bg-desa-foreshadow'"
        >
          <span class="font-semibold text-xs text-white uppercase">{{
            isAvailable ? 'Tersedia' : 'Tutup'
          }}</span>
        </div>
      </div>
      <hr class="border-desa-foreshadow" />
      <div class="grid grid-cols-2 gap-3">
        <div class="flex items-center w-full gap-3">
          <div
            class="flex size-[52px] shrink-0 rounded-2xl bg-desa-foreshadow items-center justify-center"
          >
            <img
              src="@/assets/images/icons/calendar-2-dark-green.svg"
              class="flex size-6 shrink-0"
              alt="icon"
            />
          </div>
          <div class="flex flex-col gap-1 w-full">
            <p class="font-semibold text-xl leading-[22.5px] text-desa-dark-green">
              {{ jobVacancy.start_date }}
            </p>
            <span class="font-medium text-desa-secondary"> Tanggal Pelaksanaan </span>
          </div>
        </div>
        <div class="flex items-center w-full gap-3 justify-end">
          <div class="flex flex-col gap-1 w-full text-right">
            <p class="font-semibold text-xl leading-[22.5px] text-desa-dark-blue">
              {{ jobVacancy.end_date }}
            </p>
            <span class="font-medium text-desa-secondary"> Perkiraan Selesai </span>
          </div>
          <div
            class="flex size-[52px] shrink-0 rounded-2xl bg-desa-foreshadow items-center justify-center"
          >
            <img
              src="@/assets/images/icons/calendar-2-dark-green.svg"
              class="flex size-6 shrink-0"
              alt="icon"
            />
          </div>
        </div>
      </div>
      <hr class="border-desa-foreshadow" />
      <div class="grid grid-cols-2 gap-3">
        <div class="flex items-center w-full gap-3">
          <div
            class="flex size-[52px] shrink-0 rounded-2xl bg-desa-blue/10 items-center justify-center"
          >
            <img
              src="@/assets/images/icons/profile-2user-blue.svg"
              class="flex size-6 shrink-0"
              alt="icon"
            />
          </div>
          <div class="flex flex-col gap-1 w-full">
            <p class="font-semibold text-xl leading-[22.5px] text-desa-blue">
              {{ jobVacancy.job_applicants?.length }}
            </p>
            <span class="font-medium text-desa-secondary"> Total Pelamar </span>
          </div>
        </div>
      </div>

      <hr class="border-desa-foreshadow" />
      <div class="flex flex-col gap-3">
        <p class="font-medium text-sm text-desa-secondary">
          Tentang <span>{{ jobVacancy.job_title }}</span>
        </p>
        <p class="font-medium leading-8">
          {{ jobVacancy.description }}
        </p>
      </div>
    </section>
    <section id="Applicants" class="flex flex-col rounded-3xl p-6 gap-6 bg-white">
      <div class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary">Pengajuan Applicants</p>
        <div id="Tabs-Button" class="grid grid-cols-4 gap-3">
          <button
            @click="activeTab = 'all'"
            :class="['tab-btn', 'group', { active: activeTab === 'all' }]"
          >
            <div
              class="flex items-center justify-center rounded-full border border-desa-background py-[14px] px-[18px] group-hover:bg-desa-black group-[.active]:bg-desa-black transition-setup"
            >
              <span
                class="font-medium leading-5 text-desa-secondary group-hover:text-white group-[.active]:text-white transition-setup"
              >
                SEMUA
              </span>
            </div>
          </button>
          <button
            @click="activeTab = 'pending'"
            :class="['tab-btn', 'group', { active: activeTab === 'pending' }]"
          >
            <div
              class="flex items-center justify-center rounded-full border border-desa-background py-[14px] px-[18px] group-hover:bg-desa-black group-[.active]:bg-desa-black transition-setup"
            >
              <span
                class="font-medium leading-5 text-desa-secondary group-hover:text-white group-[.active]:text-white transition-setup"
              >
                MENUNGGU
              </span>
            </div>
          </button>
          <button
            @click="activeTab = 'approved'"
            :class="['tab-btn', 'group', { active: activeTab === 'approved' }]"
          >
            <div
              class="flex items-center justify-center rounded-full border border-desa-background py-[14px] px-[18px] group-hover:bg-desa-black group-[.active]:bg-desa-black transition-setup"
            >
              <span
                class="font-medium leading-5 text-desa-secondary group-hover:text-white group-[.active]:text-white transition-setup"
              >
                DITERIMA
              </span>
            </div>
          </button>
          <button
            @click="activeTab = 'rejected'"
            :class="['tab-btn', 'group', { active: activeTab === 'rejected' }]"
          >
            <div
              class="flex items-center justify-center rounded-full border border-desa-background py-[14px] px-[18px] group-hover:bg-desa-black group-[.active]:bg-desa-black transition-setup"
            >
              <span
                class="font-medium leading-5 text-desa-secondary group-hover:text-white group-[.active]:text-white transition-setup"
              >
                DITOLAK
              </span>
            </div>
          </button>
        </div>
      </div>
      <div id="Tabs-Content" class="flex flex-col">
        <div id="All" class="flex flex-col gap-6">
          <div
            class="card flex flex-col gap-6 rounded-3xl p-6 border border-desa-background bg-white"
            v-for="applicant in filteredApplicants"
            :key="applicant.id"
          >
            <div class="flex items-center justify-between">
              <p class="flex items-center gap-1">
                <img
                  src="@/assets/images/icons/calendar-2-secondary-green.svg"
                  class="flex size-[18px] shrink-0"
                  alt="icon"
                />
                <span class="font-medium text-sm text-desa-secondary">{{
                  formatToClientTimeZone(applicant.created_at)
                }}</span>
              </p>
              <div
                class="badge rounded-full p-3 gap-2 flex w-[100px] justify-center shrink-0 bg-desa-yellow"
                v-if="applicant.status === 'pending'"
              >
                <span class="font-semibold text-xs text-white uppercase">Menunggu</span>
              </div>
              <div
                class="badge rounded-full p-3 gap-2 flex w-[100px] justify-center shrink-0 bg-desa-red"
                v-if="applicant.status === 'rejected'"
              >
                <span class="font-semibold text-xs text-white uppercase">Ditolak</span>
              </div>
              <div
                class="badge rounded-full p-3 gap-2 flex w-[100px] justify-center shrink-0 bg-desa-green"
                v-if="applicant.status === 'approved'"
              >
                <span class="font-semibold text-xs text-white uppercase">Diterima</span>
              </div>
            </div>
            <hr class="border-desa-background" />
            <div class="flex items-center gap-6 justify-between">
              <div class="flex items-center gap-3 w-[302px] shrink-0">
                <div class="flex size-[54px] rounded-full bg-desa-foreshadow overflow-hidden">
                  <img
                    :src="
                      applicant.user?.profile_picture || '/src/assets/images/photos/kk-photo-1.png'
                    "
                    class="w-full h-full object-cover"
                    alt="icon"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <p class="font-semibold text-lg leading-5 text-desa-black">
                    {{ applicant.user?.name }}
                  </p>
                </div>
              </div>
              <div
                class="flex items-center gap-3 justify-end shrink-0"
                v-if="applicant.status === 'pending' && user?.role === 'lurah'"
              >
                <button
                  @click="handleReject(applicant.id)"
                  class="flex items-center w-[120px] justify-center shrink-0 gap-[10px] rounded-2xl py-4 px-6 bg-desa-red/10"
                  :disabled="loading"
                >
                  <span class="font-medium text-desa-red">Tolak</span>
                </button>
                <button
                  @click="handleApprove(applicant.id)"
                  class="flex items-center w-[120px] justify-center shrink-0 gap-[10px] rounded-2xl py-4 px-6 bg-desa-dark-green"
                  :disabled="loading"
                >
                  <span class="font-medium text-white">Setuju</span>
                </button>
              </div>
              <div class="flex items-center gap-3 w-[236px] shrink-0">
                <div class="flex flex-col gap-1">
                  <p class="flex items-center gap-1">
                    <img
                      src="@/assets/images/icons/keyboard-secondary-green.svg"
                      class="flex size-[18px] shrink-0"
                      alt="icon"
                    />
                    <span class="font-medium text-sm text-desa-secondary">NIK</span>
                  </p>
                  <p class="font-semibold text-lg leading-5 text-desa-dark-green text-nowrap">
                    {{
                      applicant.user?.identity_number ||
                      applicant.user?.head_of_family?.identity_number ||
                      'N/A'
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <div class="flex gap-[14px]" v-if="user?.role === 'head-of-family'">
    <div
      class="w-[calc(545/1000*100%)] h-fit shrink-0 rounded-2xl bg-white p-6 flex flex-col gap-6"
    >
      <h2 class="font-medium text-sm leading-[17.5px] text-desa-secondary">Informasi Job</h2>
      <section id="Hero" class="flex items-center justify-between">
        <div
          class="flex justify-center items-center w-[120px] h-[100px] shrink-0 rounded-3xl overflow-hidden"
        >
          <img :src="jobVacancy.thumbnail" alt="image" class="size-full object-cover" />
        </div>
        <span class="p-3 rounded-full" :class="isAvailable ? 'bg-desa-dark-green' : 'bg-desa-red'">
          <span class="font-semibold text-xs leading-[15px] text-white">{{
            isAvailable ? 'Tersedia' : 'Tidak Tersedia'
          }}</span>
        </span>
      </section>
      <section id="Title" class="flex flex-col gap-[6px]">
        <h3 class="font-semibold text-xl leading-7">{{ jobVacancy.job_title }}</h3>
        <div class="flex items-center gap-1">
          <p class="font-medium leading-5 text-desa-secondary">Penanggung Jawab:</p>
          <p class="font-medium leading-5 text-desa-dark-green">
            {{ jobVacancy.company_in_charge }}
          </p>
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Points" class="flex flex-col gap-6">
        <div class="point flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-[14px] shrink-0 bg-[#FF507017] rounded-2xl">
              <img
                src="@/assets/images/icons/wallet-3-red.svg"
                alt="icon"
                class="size-6 shrink-0"
              />
            </div>
            <div class="flex flex-col gap-1">
              <p class="font-semibold text-lg leading-[22.5px] text-desa-red">
                Rp {{ formatRupiah(jobVacancy.salary) }}
              </p>
              <h3 class="font-medium text-sm leading-[17.5px] text-desa-secondary">Salary</h3>
            </div>
          </div>
        </div>
        <hr class="border-desa-background" />
        <div class="point flex items-center gap-3">
          <div class="p-[14px] shrink-0 bg-[#005CAA17] rounded-2xl">
            <img
              src="@/assets/images/icons/profile-2user-blue.svg"
              alt="icon"
              class="size-6 shrink-0"
            />
          </div>
          <div class="flex flex-col gap-1">
            <p class="font-semibold text-lg leading-[22.5px] text-desa-blue">
              {{ jobVacancy.job_applicants?.length }} Warga
            </p>
            <h3 class="font-medium text-sm leading-[17.5px] text-desa-secondary">
              Total Partisipasi
            </h3>
          </div>
        </div>
        <div class="point flex items-center gap-3">
          <div class="p-[14px] shrink-0 bg-desa-foreshadow rounded-2xl">
            <img
              src="@/assets/images/icons/calendar-2-dark-green.svg"
              alt="icon"
              class="size-6 shrink-0"
            />
          </div>
          <div class="flex flex-col gap-1">
            <p class="font-semibold text-lg leading-[22.5px] text-desa-dark-green">
              {{ jobVacancy.start_date }}
            </p>
            <h3 class="font-medium text-sm leading-[17.5px] text-desa-secondary">
              Tanggal Pelaksanaan
            </h3>
          </div>
        </div>

        <hr class="border-desa-background" />
      </section>
      <section id="Tentang-Pembangunan" class="flex flex-col gap-3">
        <h2 class="font-medium text-sm leading-[17.5px] text-desa-secondary">
          Tentang Operator Produksi
        </h2>
        <p class="font-medium leading-8">
          {{ jobVacancy.description }}
        </p>
      </section>
    </div>
    <div class="flex flex-col gap-6 rounded-2xl flex-1 h-fit bg-white p-6">
      <section id="Applicant-Details" class="flex flex-col gap-6">
        <h2 class="font-medium text-sm leading-[17.5px] text-desa-secondary">Vacancy Details</h2>
        <div class="point flex items-center gap-3">
          <div class="p-[14px] shrink-0 bg-desa-foreshadow rounded-2xl">
            <img
              src="@/assets/images/icons/timer-dark-green.svg"
              alt="icon"
              class="size-6 shrink-0"
            />
          </div>
          <div class="flex flex-col gap-1">
            <p class="font-semibold text-lg leading-[22.5px] text-desa-dark-green">
              {{ jobVacancy.day || 0 }} Hari
            </p>
            <h3 class="font-medium text-sm leading-[17.5px] text-desa-secondary">Days Needed</h3>
          </div>
        </div>
        <hr class="border-desa-background" />
        <div class="point flex items-center gap-3">
          <div class="p-[14px] shrink-0 bg-desa-foreshadow rounded-2xl">
            <img
              src="@/assets/images/icons/calendar-tick-dark-green.svg"
              alt="icon"
              class="size-6 shrink-0"
            />
          </div>
          <div class="flex flex-col gap-1">
            <p class="font-semibold text-lg leading-[22.5px] text-desa-dark-green">
              {{ jobVacancy.end_date }}
            </p>
            <h3 class="font-medium text-sm leading-[17.5px] text-desa-secondary">
              Perkiraan Selesai
            </h3>
          </div>
        </div>
        <hr class="border-desa-background" />
        <div class="point flex items-center gap-3">
          <div class="p-[14px] shrink-0 bg-desa-foreshadow rounded-2xl">
            <img
              src="@/assets/images/icons/dollar-square-dark-green.svg"
              alt="icon"
              class="size-6 shrink-0"
            />
          </div>
          <div class="flex flex-col gap-1">
            <p class="font-semibold text-lg leading-[22.5px] text-desa-dark-green">
              Rp {{ formatRupiah(jobVacancy.salary) }}
            </p>
            <h3 class="font-medium text-sm leading-[17.5px] text-desa-secondary">Bayaran Kerja</h3>
          </div>
        </div>
        <hr class="border-desa-background" />
      </section>
      <form @submit.prevent="handleSubmit.prevent" class="flex flex-col gap-6">
        <button
          v-if="!hasApplied && !isFromMyApplications"
          type="button"
          id="Pelamar-Applicant-Button"
          class="flex items-center justify-between"
          @click="isAvailable ? (showSelectApplicant = true) : null"
          :disabled="!isAvailable"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex items-center justify-center size-[52px] shrink-0 rounded-full bg-desa-foreshadow overflow-hidden"
            >
              <img
                id="default-Profile-Image"
                src="@/assets/images/photos/kk-preview.png"
                alt="image"
                class="size-full object-cover"
              />
            </div>
            <div class="flex flex-col gap-1 items-start">
              <p id="default-Profile-Name" class="font-semibold text-lg leading-[22.5px]">
                Pelamar Applicant
              </p>
              <div class="flex items-center gap-1">
                <img
                  id="Icon-If-Filled"
                  src="@/assets/images/icons/briefcase-secondary-green.svg"
                  alt="icon"
                  class="[&.input-is-filled]:block hidden size-[18px] shrink-0"
                />
                <h3
                  id="default-Profile-Status"
                  class="font-medium text-sm leading-[17.5px] text-desa-secondary"
                >
                  {{ isAvailable ? 'Pilih Anggota Keluarga' : 'Lowongan tidak tersedia' }}
                </h3>
              </div>
            </div>
          </div>
          <img
            src="@/assets/images/icons/arrow-square-right-secondary-green.svg"
            alt="icon"
            class="size-6 shrink-0"
          />
        </button>
        <div
          v-else-if="hasApplied || isFromMyApplications"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex items-center justify-center size-[52px] shrink-0 rounded-full bg-desa-foreshadow overflow-hidden"
            >
              <img
                :src="
                  matchedApplicant?.user?.profile_picture ||
                  '/src/assets/images/photos/kk-preview.png'
                "
                alt="image"
                class="size-full object-cover"
              />
            </div>
            <div class="flex flex-col gap-1 items-start">
              <p class="font-semibold text-lg leading-[22.5px]">
                {{ matchedApplicant?.user?.name || 'Pelamar' }}
              </p>
              <div class="flex items-center gap-1" v-if="matchedOccupation">
                <img
                  src="@/assets/images/icons/briefcase-secondary-green.svg"
                  alt="icon"
                  class="size-[18px] shrink-0"
                />
                <span class="font-medium leading-5 text-desa-secondary">{{
                  matchedOccupation
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <hr class="border-desa-background" />
        <div>
          <!-- If user comes from "my-applications" page, always show "Kamu sudah melamar" -->
          <div
            v-if="isFromMyApplications"
            class="font-medium leading-5 text-desa-dark-green py-[18px] flex justify-center items-center bg-green-100 rounded-2xl"
          >
            Kamu sudah melamar
          </div>
          <!-- If user comes from "all" or other pages, show normal logic -->
          <button
            v-else-if="!hasApplied"
            type="button"
            class="font-medium leading-5 text-white py-[18px] flex justify-center items-center rounded-2xl w-full"
            :class="
              isAvailable ? 'bg-desa-dark-green cursor-pointer' : 'bg-desa-red cursor-not-allowed'
            "
            @click="isAvailable ? (showSelectApplicant = true) : null"
            :disabled="!isAvailable"
          >
            {{ isAvailable ? 'Confirm & Apply Now' : 'Tidak tersedia' }}
          </button>
          <div
            v-else
            class="font-medium leading-5 text-desa-dark-green py-[18px] flex justify-center items-center bg-green-100 rounded-2xl"
          >
            Kamu sudah melamar
          </div>
        </div>
        <!-- modal -->
        <div
          id="modal"
          class="fixed inset-0 flex items-center justify-center bg-[#001B1ACC] z-50"
          v-if="showSelectApplicant"
        >
          <div class="bg-white rounded-2xl p-4 w-[760px] flex flex-col gap-6">
            <div class="flex items-center justify-between">
              <div class="flex flex-col gap-2">
                <h3 class="font-semibold text-2xl leading-[30px]">Pilih Pelamar Applicant</h3>
                <p class="font-medium text-sm leading-[17.5px] text-desa-secondary">
                  Pilih salah satu anggota keluarga
                </p>
              </div>
              <button
                id="closeModal"
                class="py-4 px-6 border border-desa-background rounded-2xl bg-white flex items-center gap-2"
                @click="showSelectApplicant = false"
              >
                <img
                  src="@/assets/images/icons/close-square-secondary-green.svg"
                  alt="icon"
                  class="size-6 shrink-0"
                />
                <p class="font-medium leading-5 text-desa-secondary">Tutup</p>
              </button>
            </div>
            <hr class="border-desa-background" />
            <ul
              id="Profile-List"
              class="flex flex-col gap-6 max-h-[497px] overflow-y-auto hide-scrollbar px-[1.5px] pb-[2px]"
            >
              <li>
                <label class="profile flex flex-col gap-3 bg-white rounded-3xl">
                  <h4 class="font-medium leading-[17.5px] text-sm text-desa-secondary">You</h4>
                  <div
                    class="data rounded-2xl border border-desa-background p-6 flex items-center gap-[49px] hover:ring-[1.5px] hover:ring-desa-dark-green transition-all duration-300"
                  >
                    <div class="name flex items-center gap-3">
                      <div
                        class="flex size-[64px] shrink-0 rounded-full overflow-hidden bg-desa-foreshadow"
                      >
                        <img
                          :src="user?.head_of_family?.profile_picture"
                          class="w-full h-full object-cover"
                          alt="photo"
                        />
                      </div>
                      <div class="flex flex-col gap-[6px]">
                        <h5 class="font-semibold text-lg leading-[22.5px] truncate w-[164px]">
                          {{ user?.name }}
                        </h5>
                        <div class="flex items-center gap-1">
                          <img
                            src="@/assets/images/icons/briefcase-secondary-green.svg"
                            alt="icon"
                            class="size-[18px] shrink-0"
                          />
                          <p class="font-medium leading-5 text-desa-secondary truncate w-[142px]">
                            {{ user?.head_of_family?.occupation }}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div class="nik flex flex-col gap-[6px]">
                      <div class="flex items-center gap-1">
                        <img
                          src="@/assets/images/icons/keyboard-secondary-green.svg"
                          alt="icon"
                          class="size-[18px] shrink-0"
                        />
                        <h5 class="font-medium text-sm leading-[17.5px] text-desa-secondary">
                          NIK
                        </h5>
                      </div>
                      <p class="font-semibold leading-5 truncate w-[155px]">
                        {{ user?.head_of_family?.identity_number }}
                      </p>
                    </div>
                    <div class="umur flex flex-col gap-[6px]">
                      <div class="flex items-center gap-1">
                        <img
                          src="@/assets/images/icons/timer-secondary-green.svg"
                          alt="icon"
                          class="size-[18px] shrink-0"
                        />
                        <h5 class="font-medium text-sm leading-[17.5px] text-desa-secondary">
                          Umur
                        </h5>
                      </div>
                      <p class="font-semibold leading-5 truncate w-[92px]">
                        {{ calculateAge(user?.head_of_family?.date_of_birth) }} Tahun
                      </p>
                    </div>
                    <input
                      required
                      type="radio"
                      name="anggota"
                      :value="user?.id"
                      v-model="selectedApplicantId"
                      class="flex size-[30px] shrink-0 accent-desa-dark-green"
                    />
                  </div>
                </label>
              </li>
              <li
                v-for="wife in familyMembers.filter((member) => member.relation === 'wife')"
                :key="wife.id"
              >
                <label class="profile flex flex-col gap-3 bg-white rounded-3xl">
                  <h4 class="font-medium leading-[17.5px] text-sm text-desa-secondary">Istri</h4>
                  <div
                    class="data rounded-2xl border border-desa-background p-6 flex items-center gap-[49px] hover:ring-[1.5px] hover:ring-desa-dark-green transition-all duration-300"
                  >
                    <div class="name flex items-center gap-3">
                      <div
                        class="flex size-[64px] shrink-0 rounded-full overflow-hidden bg-desa-foreshadow"
                      >
                        <img
                          :src="wife.profile_picture"
                          class="w-full h-full object-cover"
                          alt="photo"
                        />
                      </div>
                      <div class="flex flex-col gap-[6px]">
                        <h5 class="font-semibold text-lg leading-[22.5px] truncate w-[164px]">
                          {{ wife.user?.name }}
                        </h5>
                        <div class="flex items-center gap-1">
                          <img
                            src="@/assets/images/icons/briefcase-secondary-green.svg"
                            alt="icon"
                            class="size-[18px] shrink-0"
                          />
                          <p class="font-medium leading-5 text-desa-secondary truncate w-[142px]">
                            {{ wife.occupation }}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div class="nik flex flex-col gap-[6px]">
                      <div class="flex items-center gap-1">
                        <img
                          src="@/assets/images/icons/keyboard-secondary-green.svg"
                          alt="icon"
                          class="size-[18px] shrink-0"
                        />
                        <h5 class="font-medium text-sm leading-[17.5px] text-desa-secondary">
                          NIK
                        </h5>
                      </div>
                      <p class="font-semibold leading-5 truncate w-[155px]">
                        {{ wife.identity_number }}
                      </p>
                    </div>
                    <div class="umur flex flex-col gap-[6px]">
                      <div class="flex items-center gap-1">
                        <img
                          src="@/assets/images/icons/timer-secondary-green.svg"
                          alt="icon"
                          class="size-[18px] shrink-0"
                        />
                        <h5 class="font-medium text-sm leading-[17.5px] text-desa-secondary">
                          Umur
                        </h5>
                      </div>
                      <p class="font-semibold leading-5 truncate w-[92px]">
                        {{ calculateAge(wife.date_of_birth) }} Tahun
                      </p>
                    </div>
                    <input
                      required
                      type="radio"
                      name="anggota"
                      :value="wife.user_id || wife.user?.id"
                      v-model="selectedApplicantId"
                      class="flex size-[30px] shrink-0 accent-desa-dark-green"
                    />
                  </div>
                </label>
              </li>

              <li
                v-for="child in familyMembers.filter((member) => member.relation === 'child')"
                :key="child.id"
              >
                <label class="profile flex flex-col gap-3 bg-white rounded-3xl">
                  <h4 class="font-medium leading-[17.5px] text-sm text-desa-secondary">Anak</h4>
                  <div
                    class="data rounded-2xl border border-desa-background p-6 flex items-center gap-[49px] hover:ring-[1.5px] hover:ring-desa-dark-green transition-all duration-300"
                  >
                    <div class="name flex items-center gap-3">
                      <div
                        class="flex size-[64px] shrink-0 rounded-full overflow-hidden bg-desa-foreshadow"
                      >
                        <img
                          :src="child.profile_picture"
                          class="w-full h-full object-cover"
                          alt="photo"
                        />
                      </div>
                      <div class="flex flex-col gap-[6px]">
                        <h5 class="font-semibold text-lg leading-[22.5px] truncate w-[164px]">
                          {{ child.user?.name }}
                        </h5>
                        <div class="flex items-center gap-1">
                          <img
                            src="@/assets/images/icons/briefcase-secondary-green.svg"
                            alt="icon"
                            class="size-[18px] shrink-0"
                          />
                          <p class="font-medium leading-5 text-desa-secondary truncate w-[142px]">
                            {{ child.occupation }}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div class="nik flex flex-col gap-[6px]">
                      <div class="flex items-center gap-1">
                        <img
                          src="@/assets/images/icons/keyboard-secondary-green.svg"
                          alt="icon"
                          class="size-[18px] shrink-0"
                        />
                        <h5 class="font-medium text-sm leading-[17.5px] text-desa-secondary">
                          NIK
                        </h5>
                      </div>
                      <p class="font-semibold leading-5 truncate w-[155px]">
                        {{ child.identity_number }}
                      </p>
                    </div>
                    <div class="umur flex flex-col gap-[6px]">
                      <div class="flex items-center gap-1">
                        <img
                          src="@/assets/images/icons/timer-secondary-green.svg"
                          alt="icon"
                          class="size-[18px] shrink-0"
                        />
                        <h5 class="font-medium text-sm leading-[17.5px] text-desa-secondary">
                          Umur
                        </h5>
                      </div>
                      <p class="font-semibold leading-5 truncate w-[92px]">
                        {{ calculateAge(child.date_of_birth) }} Tahun
                      </p>
                    </div>
                    <input
                      required
                      type="radio"
                      name="anggota"
                      :value="child.user_id || child.user?.id"
                      v-model="selectedApplicantId"
                      class="flex size-[30px] shrink-0 accent-desa-dark-green"
                    />
                  </div>
                </label>
              </li>
            </ul>
            <div class="flex gap-3 pt-4 border-t border-desa-background">
              <button
                type="button"
                @click="showSelectApplicant = false"
                class="flex-1 py-[18px] rounded-2xl bg-red-100 flex justify-center items-center font-medium leading-5 text-desa-red"
              >
                Batal
              </button>
              <button
                type="button"
                @click="handleModalSubmit"
                :disabled="applicantLoading"
                class="flex-1 py-[18px] rounded-2xl bg-desa-dark-green flex justify-center items-center font-medium leading-5 text-white disabled:opacity-50"
              >
                <span v-if="!applicantLoading">Kirim Lamaran</span>
                <span v-else>Mengirim...</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>

  <ModalDelete
    :show="showModalDelete"
    title="Hapus Informasi Lowongan Pekerjaan ?"
    :loading="loading"
    @close="showModalDelete = false"
    @confirm="handleDelete"
  />
</template>
