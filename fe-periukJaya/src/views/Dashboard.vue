<script setup>
import { useDashboardStore } from '@/stores/dashboard'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import { Chart } from 'chart.js/auto'
import { useAuthStore } from '@/stores/auth'
import { RouterLink } from 'vue-router'
import { useFamilyMemberStore } from '@/stores/familyMember'
import { useSocialAssistanceRecipientStore } from '@/stores/socialAssistanceRecipient'
import { formatRupiah, formatToClientTimeZone } from '@/helpers/format'
import { useEventParticipantStore } from '@/stores/eventParticipant'
import { useJobVacancyApplicantStore } from '@/stores/jobApplicant'

const dashboardStore = useDashboardStore()
const { dashboardData, loading } = storeToRefs(dashboardStore)
const { fetchDashboardData } = dashboardStore

const familyMemberStore = useFamilyMemberStore()
const { familyMembers, loading: loadingFamilyMember } = storeToRefs(familyMemberStore)
const { fetchFamilyMembers } = familyMemberStore

const socialAssistanceRecipientStore = useSocialAssistanceRecipientStore()
const { socialAssistanceRecipients, loading: loadingSocialAssistanceRecipient } = storeToRefs(
  socialAssistanceRecipientStore,
)
const { fetchSocialAssistanceRecipients } = socialAssistanceRecipientStore

const eventParticipantStore = useEventParticipantStore()
const { eventParticipants, loading: loadingEventParticipant } = storeToRefs(eventParticipantStore)
const { fetchEventParticipants } = eventParticipantStore

const jobApplicantStore = useJobVacancyApplicantStore()
const { recentApplicants, loading: loadingJobApplicant } = storeToRefs(jobApplicantStore)
const { fetchJobApplicantsByUser } = jobApplicantStore

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const residentChart = ref(null)

// Date Picker State
const currentWeekStart = ref(new Date())
const selectedDate = ref(new Date())

// Helper functions (must be defined before getWeekDays)
const isSameDay = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

const hasEventOnDate = (date) => {
  if (!dashboardData.value?.upcoming_events) return false
  
  return dashboardData.value.upcoming_events.some(event => {
    const eventDate = new Date(event.start_date)
    return isSameDay(date, eventDate)
  })
}

// Get week days starting from a specific date
const getWeekDays = () => {
  const start = new Date(currentWeekStart.value)
  const days = []
  
  // Find Monday of the week
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)
  start.setDate(diff)
  
  // Get 7 days starting from Monday
  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    days.push({
      date: date,
      day: date.getDate(),
      dayName: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][date.getDay()],
      isToday: isSameDay(date, new Date()),
      isSelected: isSameDay(date, selectedDate.value),
      hasEvent: hasEventOnDate(date)
    })
  }
  
  return days
}

const weekDays = ref(getWeekDays())

const getCurrentMonthYear = () => {
  const date = new Date(currentWeekStart.value)
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

const navigateWeek = (direction) => {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() + (direction * 7))
  currentWeekStart.value = newDate
  weekDays.value = getWeekDays()
}

const selectDate = (day) => {
  selectedDate.value = new Date(day.date)
  weekDays.value = getWeekDays()
}

// Filter events based on selected date
const filteredEvents = computed(() => {
  if (!dashboardData.value?.upcoming_events) return []
  
  // If a specific date is selected, show events only for that date
  return dashboardData.value.upcoming_events.filter(event => {
    const eventDate = new Date(event.start_date)
    return isSameDay(eventDate, selectedDate.value)
  })
})

// Show all upcoming events or filtered events
const eventsToDisplay = computed(() => {
  // If filtered events exist, show them; otherwise show all upcoming events
  if (filteredEvents.value.length > 0) {
    return filteredEvents.value
  }
  return dashboardData.value?.upcoming_events || []
})

const getResidentStatistic = () => {
  const chartElement = document.getElementById('myChart')
  if (!chartElement) return
  
  // Destroy existing chart if it exists
  if (residentChart.value) {
    residentChart.value.destroy()
  }
  
  residentChart.value = new Chart(chartElement, {
    type: 'doughnut',
    data: {
      datasets: [
        {
          data: [114210, 97200, 24300],
          backgroundColor: ['#ff770f', '#7d4d01', '#a80900'],
        },
      ],
    },
    options: {
      scales: {
        x: {
          display: false,
        },
        y: {
          display: false,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
      datasets: {
        doughnut: {
          spacing: 2,
          borderRadius: 6,
          cutout: '65%',
        },
      },
    },
  })
}

onUnmounted(() => {
  if (residentChart.value) {
    residentChart.value.destroy()
    residentChart.value = null
  }
})

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

const calculateDaysUntil = (dateString) => {
  const today = new Date()
  const targetDate = new Date(dateString)
  const timeDiff = targetDate - today
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  return daysDiff > 0 ? daysDiff : 0
}

const downloadReport = () => {
  if (!dashboardData.value) {
    alert('Data belum tersedia untuk didownload')
    return
  }

  // Create CSV content
  const csvContent = [
    ['LAPORAN DATA DESA'],
    ['Tanggal', new Date().toLocaleDateString('id-ID')],
    [],
    ['STATISTIK'],
    ['Kategori', 'Jumlah'],
    ['Total Penduduk', dashboardData.value.residents || 0],
    ['Kepala Keluarga', dashboardData.value.head_of_families || 0],
    ['Bantuan Sosial', dashboardData.value.social_assistances || 0],
    ['Event', dashboardData.value.events || 0],
    ['Job Applicants', dashboardData.value.job_applicants || 0],
    ['Job Vacancies', dashboardData.value.job_vacancies || 0],
  ]
    .map((row) => row.join(','))
    .join('\n')

  // Create blob and download
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `laporan-desa-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const downloadFamilyReport = () => {
  if (!familyMembers.value || familyMembers.value.length === 0) {
    alert('Data anggota keluarga belum tersedia')
    return
  }

  // Create CSV content for family report
  const csvContent = [
    ['LAPORAN RUMAH TANGGA'],
    ['Tanggal', new Date().toLocaleDateString('id-ID')],
    ['Kepala Keluarga', user.value?.name || ''],
    [],
    ['ANGGOTA KELUARGA'],
    ['Nama', 'NIK', 'Pekerjaan', 'Tanggal Lahir', 'Umur'],
    ...familyMembers.value.map((member) => [
      member.user?.name || '-',
      member.identity_number || '-',
      member.occupation || '-',
      member.date_of_birth || '-',
      calculateAge(member.date_of_birth) + ' tahun',
    ]),
    [],
    ['PENGAJUAN BANTUAN SOSIAL'],
    ['Total Pengajuan', socialAssistanceRecipients.value?.length || 0],
    [],
    ['EVENT YANG DIIKUTI'],
    ['Total Event', eventParticipants.value?.length || 0],
  ]
    .map((row) => row.join(','))
    .join('\n')

  // Create blob and download
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `laporan-keluarga-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// onMounted(() => {
//   if (user?.role === "lurah") {
//     fetchDashboardData();
//     getResidentStatistic();
//   }

//   if (user?.role === "head-of-family") {
//     fetchFamilyMembers();
//   }
// });

watch(
  user,
  async (newUser) => {
    if (newUser?.role === 'lurah') {
      // Small delay to ensure session is fully ready
      await new Promise(resolve => setTimeout(resolve, 200))
      fetchDashboardData()
      getResidentStatistic()
    }

    if (newUser?.role === 'head-of-family') {
      // Small delay to ensure session is fully ready
      await new Promise(resolve => setTimeout(resolve, 200))
      fetchFamilyMembers()
      fetchSocialAssistanceRecipients()
      fetchEventParticipants()
      
      // Fetch job applicants for the current user
      if (newUser?.id) {
        fetchJobApplicantsByUser(newUser.id)
      }
    }
  },
  { immediate: true },
)

// Update week days when dashboard data changes (to show events on calendar)
watch(
  dashboardData,
  () => {
    weekDays.value = getWeekDays()
  },
  { deep: true }
)
</script>

<template>
  <div id="Dashboard-lurah" v-if="user?.role === 'lurah'">
    <h1 class="font-semibold text-2xl">Desa Statistics</h1>
    <div id="Row-1" class="flex gap-[14px]">
      <div
        class="flex flex-col w-[calc(389/1000*100%)] h-[358px] rounded-2xl p-6 gap-6 gradient-vertical"
      >
        <img
          src="@/assets/images/icons/gift-orange-background.svg"
          class="flex size-[86px] shrink-0"
          alt="icon"
        />
        <div class="flex flex-col gap-3">
          <p class="font-medium text-sm text-desa-lime">— Bantuan Sosial</p>
          <p class="font-semibold text-2xl text-white text-nowrap">Dari Desa untuk Warga ❤️</p>
          <p class="text-white">
            Wujudkan kesejahteraan desa dengan bantuan sosial yang tepat sasaran.
          </p>
        </div>
        <RouterLink 
          :to="{ name: 'create-social-assistance' }" 
          class="flex items-center justify-between rounded-2xl p-4 gap-[10px] bg-white hover:bg-desa-foreshadow transition-colors"
        >
          <span class="font-medium text-desa-dark-green leading-5">Bikin Bantuan Sosial</span>
          <img
            src="@/assets/images/icons/add-square-dark-green.svg"
            class="flex size-6 shrink-0"
            alt="icon"
          />
        </RouterLink>
      </div>
      <section id="Statistics" class="grid grid-cols-2 flex-1 shrink-0 gap-[14px]">
        <div class="card flex flex-col w-full rounded-2xl p-6 gap-3 bg-white">
          <div class="flex items-center justify-between">
            <p class="font-medium text-desa-secondary">Jumlah Penduduk</p>
            <img
              src="@/assets/images/icons/profil-2user-foreshadow-background.svg"
              class="flex size-12 shrink-0"
              alt="icon"
            />
          </div>
          <div class="flex flex-col gap-[6px]">
            <p class="font-semibold text-[32px] leading-10">
              {{ dashboardData?.residents }}
            </p>
            <div class="flex items-center gap-0.5">
              <img
                src="@/assets/images/icons/trend-up-dark-green-fill.svg"
                class="flex size-[18px] shrink-0"
                alt="icon"
              />
              <p class="font-medium text-sm text-desa-secondary">
                <span class="text-desa-dark-green">+12%</span>
                dari bulan sebelumnya
              </p>
            </div>
          </div>
        </div>
        <div class="card flex flex-col w-full rounded-2xl p-6 gap-3 bg-white">
          <div class="flex items-center justify-between">
            <p class="font-medium text-desa-secondary">Job Applicant</p>
            <img
              src="@/assets/images/icons/buildings-foreshadow-background.svg"
              class="flex size-12 shrink-0"
              alt="icon"
            />
          </div>
          <div class="flex flex-col gap-[6px]">
            <p class="font-semibold text-[32px] leading-10">
              {{ dashboardData?.job_vacancies }}
            </p>
            <div class="flex items-center gap-0.5">
              <img
                src="@/assets/images/icons/trend-up-dark-green-fill.svg"
                class="flex size-[18px] shrink-0"
                alt="icon"
              />
              <p class="font-medium text-sm text-desa-secondary">
                <span class="text-desa-dark-green">+12%</span>
                dari bulan sebelumnya
              </p>
            </div>
          </div>
        </div>
        <div class="card flex flex-col w-full rounded-2xl p-6 gap-3 bg-white">
          <div class="flex items-center justify-between">
            <p class="font-medium text-desa-secondary">Kepala Rumah</p>
            <img
              src="@/assets/images/icons/crown-foreshadow-background.svg"
              class="flex size-12 shrink-0"
              alt="icon"
            />
          </div>
          <div class="flex flex-col gap-[6px]">
            <p class="font-semibold text-[32px] leading-10">
              {{ dashboardData?.head_of_families }}
            </p>
            <div class="flex items-center gap-0.5">
              <img
                src="@/assets/images/icons/trend-up-dark-green-fill.svg"
                class="flex size-[18px] shrink-0"
                alt="icon"
              />
              <p class="font-medium text-sm text-desa-secondary">
                <span class="text-desa-dark-green">+12%</span>
                dari bulan sebelumnya
              </p>
            </div>
          </div>
        </div>
        <div class="card flex flex-col w-full rounded-2xl p-6 gap-3 bg-white">
          <div class="flex items-center justify-between">
            <p class="font-medium text-desa-secondary">Total Events</p>
            <img
              src="@/assets/images/icons/calendar-2-foreshadow-background.svg"
              class="flex size-12 shrink-0"
              alt="icon"
            />
          </div>
          <div class="flex flex-col gap-[6px]">
            <p class="font-semibold text-[32px] leading-10">
              {{ dashboardData?.events }}
            </p>
            <div class="flex items-center gap-0.5">
              <img
                src="@/assets/images/icons/trend-up-dark-green-fill.svg"
                class="flex size-[18px] shrink-0"
                alt="icon"
              />
              <p class="font-medium text-sm text-desa-secondary">
                <span class="text-desa-dark-green">+12%</span>
                dari bulan sebelumnya
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
    <div id="Row-2" class="flex gap-[14px]">
      <section
        id="Bantuan-Sosial"
        class="flex flex-col w-[calc(497/1000*100%)] shrink-0 rounded-2xl bg-white"
      >
        <div class="flex flex-col gap-3 p-6">
          <div class="flex items-center justify-between">
            <p class="font-medium text-desa-secondary">Bantuan Sosial</p>
            <img
              src="@/assets/images/icons/bag-2-foreshadow-background.svg"
              class="flex size-12 shrink-0"
              alt="icon"
            />
          </div>
          <div class="flex flex-col gap-[6px]">
            <p class="font-semibold text-[32px] leading-10">
              {{ dashboardData?.social_assistances }}
            </p>
            <div class="flex items-center gap-0.5">
              <img
                src="@/assets/images/icons/trend-up-dark-green-fill.svg"
                class="flex size-[18px] shrink-0"
                alt="icon"
              />
              <p class="font-medium text-sm text-desa-secondary">
                <span class="text-desa-dark-green">+12%</span>
                dari bulan sebelumnya
              </p>
            </div>
          </div>
        </div>
        <hr class="border-desa-foreshadow" />
        <div class="flex flex-col gap-4 p-6">
          <p class="font-semibold text-[20px] leading-[25px] text-left w-full">Bansos Terakhir</p>
          
          <template v-if="dashboardData?.recent_social_assistance_recipients?.length > 0">
            <template v-for="(recipient, index) in dashboardData.recent_social_assistance_recipients" :key="recipient.id">
          <div class="card flex items-center w-full gap-3">
            <div
              class="flex size-[72px] shrink-0 rounded-2xl bg-desa-foreshadow items-center justify-center"
            >
              <img
                    :src="recipient.social_assistance?.category === 'barang' ? '/src/assets/images/icons/bag-2-dark-green.svg' : '/src/assets/images/icons/money-dark-green.svg'"
                class="flex size-9 shrink-0"
                alt="icon"
              />
            </div>
            <div class="flex flex-col gap-[6px] w-full">
                  <p class="font-semibold text-xl leading-[25px]">
                    {{ recipient.social_assistance?.category === 'uang' ? `Rp${formatRupiah(recipient.amount)}` : recipient.social_assistance?.name }}
                  </p>
              <div class="flex items-center gap-0.5 font-medium text-desa-secondary">
                <img
                  src="@/assets/images/icons/profile-secondary-green.svg"
                  class="flex size-[18px] shrink-0"
                  alt="icon"
                />
                    <span class="line-clamp-1"> Diberikan oleh {{ recipient.applicant?.name }} </span>
              </div>
            </div>
            <div
                  class="badge rounded-full p-3 gap-2 flex w-[100px] justify-center shrink-0"
                  :class="{
                    'bg-desa-yellow': recipient.status === 'pending',
                    'bg-desa-dark-green': recipient.status === 'approved',
                    'bg-desa-orange': recipient.status === 'rejected'
                  }"
                >
                  <span class="font-semibold text-xs text-white uppercase">
                    {{ recipient.status === 'pending' ? 'Menunggu' : recipient.status === 'approved' ? 'Diterima' : 'Ditolak' }}
                  </span>
            </div>
          </div>
              <hr v-if="index < dashboardData.recent_social_assistance_recipients.length - 1" class="border-desa-foreshadow" />
            </template>
          </template>
          
          <div
            v-else
            class="m-auto h-[384px] flex flex-col shrink-0 justify-center items-center gap-6"
          >
            <img
              src="@/assets/images/icons/bag-cross-secondary.svg"
              class="flex size-[52px] shrink-0"
              alt="icon"
            />
            <p class="font-medium leading-5 text-center text-desa-secondary">
              Ups, nampaknya belum ada bansos
            </p>
          </div>
        </div>
      </section>
      <section id="Event" class="flex flex-col flex-1 shrink-0 rounded-2xl bg-white">
        <div id="Date-Picker" class="flex flex-col gap-4 p-6">
          <div class="flex items-center justify-between">
            <button
              @click="navigateWeek(-1)"
              class="flex items-center justify-center size-14 rounded-2xl border border-desa-foreshadow hover:border-desa-dark-green transition-colors"
            >
              <img
                src="@/assets/images/icons/arrow-left-secondary-green.svg"
                class="flex size-6 shrink-0"
                alt="icon"
              />
            </button>
            <p class="font-semibold text-xl">{{ getCurrentMonthYear() }}</p>
            <button
              @click="navigateWeek(1)"
              class="flex items-center justify-center size-14 rounded-2xl border border-desa-foreshadow hover:border-desa-dark-green transition-colors"
            >
              <img
                src="@/assets/images/icons/arrow-left-secondary-green.svg"
                class="flex size-6 shrink-0 rotate-180"
                alt="icon"
              />
            </button>
          </div>
          <div class="flex justify-between">
            <button 
              v-for="day in weekDays" 
              :key="day.date.getTime()"
              @click="selectDate(day)"
              class="group flex flex-col items-center w-[46px] h-[76px] shrink-0 gap-3"
              :class="{ 'active': day.isSelected }"
            >
              <div
                class="relative flex rounded-full size-[46px] items-center justify-center bg-desa-foreshadow group-[.active]:bg-desa-soft-green transition-colors"
              >
                <span class="font-medium text-desa-dark-green group-[.active]:text-white">
                  {{ day.day }}
                </span>
                <span 
                  v-if="day.hasEvent" 
                  class="absolute top-1 right-1 size-2 rounded-full bg-desa-orange"
                  title="Ada event"
                ></span>
              </div>
              <span 
                class="font-medium text-sm text-desa-secondary group-[.active]:text-desa-black"
                :class="{ 'text-desa-dark-green font-semibold': day.isToday }"
              >
                {{ day.dayName }}
              </span>
            </button>
          </div>
        </div>
        <hr class="border-desa-foreshadow" />
        <div id="Events" class="flex flex-col flex-1 gap-4 p-6">
          <div class="flex items-center justify-between">
            <p class="font-medium text-sm text-desa-secondary">
              {{ selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }) }}
            </p>
            <span class="font-medium text-desa-secondary">
              Events ({{ eventsToDisplay.length }})
            </span>
            <button
              @click="selectedDate = new Date(); weekDays = getWeekDays()"
              class="text-xs text-desa-dark-green hover:underline font-medium"
            >
              Hari Ini
            </button>
          </div>
          
          <template v-if="eventsToDisplay.length > 0">
          <div
              v-for="event in eventsToDisplay"
              :key="event.id"
            class="event-card relative flex w-full h-[365px] shrink-0 rounded-2xl bg-desa-background overflow-hidden"
          >
            <img
                :src="event.thumbnail || '/src/assets/images/thumbnails/pengajian_bersama.jpg'"
              class="w-full h-full object-cover object-top"
              alt="thumbnails"
            />
            <div
              class="absolute inset-3 top-auto text-white flex flex-col rounded-[18px] border border-white/20 p-4 gap-[6px] backdrop-blur-xl bg-white/[2%]"
            >
                <p class="font-semibold text-xl leading-[25px]">{{ event.name }}</p>
              <div class="flex items-center gap-1">
                <img
                  src="@/assets/images/icons/clock-white.svg"
                  class="flex size-[18px] shrink-0"
                  alt="icon"
                />
                  <p class="font-medium">{{ event.start_time || '00:00' }} WIB</p>
              </div>
            </div>
          </div>
          </template>
          
          <div
            v-else
            class="m-auto h-[384px] flex flex-col shrink-0 justify-center items-center gap-6"
          >
            <img
              src="@/assets/images/icons/calendar-remove-secondary-green.svg"
              class="flex size-[52px] shrink-0"
              alt="icon"
            />
            <p class="font-medium leading-5 text-center text-desa-secondary">
              Tidak ada event pada tanggal ini
            </p>
            <button
              @click="selectedDate = new Date(); weekDays = getWeekDays()"
              class="px-4 py-2 rounded-xl bg-desa-dark-green text-white font-medium hover:bg-opacity-90 transition-all"
            >
              Kembali ke Hari Ini
            </button>
          </div>
        </div>
      </section>
    </div>
    <div id="Row-3" class="flex gap-[14px]">
      <section id="Total-Aplicants" class="flex flex-col gap-[14px] w-[calc(603/1000*100%)]">
        <div class="flex flex-col flex-1 shrink-0 rounded-2xl bg-white">
          <div class="flex flex-col gap-3 p-6">
            <div class="flex items-center justify-between">
              <p class="font-medium text-desa-secondary">Total Applicants</p>
              <img
                src="@/assets/images/icons/document-text-foreshadow-background.svg"
                class="flex size-12 shrink-0"
                alt="icon"
              />
            </div>
            <div class="flex flex-col gap-[6px]">
              <p class="font-semibold text-[32px] leading-10">
                {{ dashboardData?.job_vacancies }}
              </p>
              <div class="flex items-center gap-0.5">
                <img
                  src="@/assets/images/icons/trend-up-dark-green-fill.svg"
                  class="flex size-[18px] shrink-0"
                  alt="icon"
                />
                <p class="font-medium text-sm text-desa-secondary">
                  <span class="text-desa-dark-green">+12%</span>
                  dari bulan sebelumnya
                </p>
              </div>
            </div>
          </div>
          <hr class="border-desa-foreshadow" />
          <div class="flex flex-col gap-4 p-6">
            <p class="font-semibold text-[20px] leading-[25px] text-left w-full">
              Applicant Terakhir
            </p>
            
            <template v-if="dashboardData?.recent_job_applicants?.length > 0">
              <template v-for="(applicant, index) in dashboardData.recent_job_applicants" :key="applicant.id">
            <div class="card flex items-center w-full gap-3">
              <div class="flex size-[72px] shrink-0 rounded-2xl bg-desa-foreshadow overflow-hidden">
                <img
                      :src="applicant.job_vacancy?.thumbnail || '/src/assets/images/thumbnails/PT Cingluh.jpg'"
                  class="w-full h-full object-cover"
                      alt="company"
                />
              </div>
              <div class="flex flex-col gap-[6px] w-full">
                <div class="flex items-center gap-[6px]">
                  <div class="flex size-8 rounded-full overflow-hidden bg-desa-foreshadow">
                    <img
                          :src="applicant.applicant?.profile_picture || '/src/assets/images/photos/kk-photo-1.png'"
                      class="w-full h-full object-cover"
                          alt="applicant"
                    />
                  </div>
                      <p class="font-medium text-xl leading-[22.5px] line-clamp-1">
                        {{ applicant.applicant?.name || 'Unknown' }}
                      </p>
                </div>
                <span class="font-medium text-desa-secondary line-clamp-1">
                      Melamar {{ applicant.job_vacancy?.position || 'Position' }} {{ applicant.job_vacancy?.company || '' }}
                </span>
              </div>
              <div
                    class="badge rounded-full p-3 gap-2 flex w-[100px] justify-center shrink-0"
                    :class="{
                      'bg-desa-yellow': applicant.status === 'pending',
                      'bg-desa-dark-green': applicant.status === 'accepted',
                      'bg-desa-orange': applicant.status === 'rejected'
                    }"
                  >
                    <span class="font-semibold text-xs text-white uppercase">
                      {{ applicant.status === 'pending' ? 'Menunggu' : applicant.status === 'accepted' ? 'Diterima' : 'Ditolak' }}
                </span>
              </div>
              </div>
                <hr v-if="index < dashboardData.recent_job_applicants.length - 1" class="border-desa-foreshadow" />
              </template>
            </template>
            
            <div
              v-else
              class="m-auto h-[280px] flex flex-col shrink-0 justify-center items-center gap-6"
            >
              <img
                src="@/assets/images/icons/note-remove-secondary.svg"
                class="flex size-[52px] shrink-0"
                alt="icon"
              />
              <p class="font-medium leading-5 text-center text-desa-secondary">
                Ups, nampaknya belum ada Applicant
              </p>
            </div>
          </div>
        </div>
        <div
          class="flex items-center justify-between h-[125px] rounded-2xl p-8 gap-4 gradient-horizontal"
        >
          <div class="flex flex-col gap-[6px]">
            <p class="font-medium text-sm text-desa-lime">— Unduh Data Desa</p>
            <p class="font-semibold text-2xl text-white text-nowrap">Data Desa Terkini</p>
          </div>
          <button 
            @click="downloadReport" 
            class="flex items-center flex-nowrap rounded-2xl p-4 gap-[10px] bg-white hover:bg-desa-foreshadow transition-colors"
            :disabled="loading"
          >
            <span class="font-medium text-desa-dark-green">
              {{ loading ? 'Downloading...' : 'Download Laporan' }}
            </span>
            <img
              src="@/assets/images/icons/receive-square-dark-green.svg"
              class="flex size-6 shrink-0"
              alt="icon"
            />
          </button>
        </div>
      </section>
      <section
        id="statistik-Penduduk"
        class="flex flex-col flex-1 shrink-0 gap-4 p-6 rounded-2xl bg-white"
      >
        <div class="flex items-center justify-between">
          <p class="font-medium text-desa-secondary">Statistics Penduduk</p>
          <img
            src="@/assets/images/icons/profile-2user-foreshadow-background.svg"
            class="flex size-12 shrink-0"
            alt="icon"
          />
        </div>
        <div class="relative">
          <div class="absolute flex flex-col gap-1 justify-center items-center text-center inset-0">
            <p class="font-semibold text-[32px] leading-10">{{ dashboardData?.residents?.toLocaleString() || '0' }}</p>
            <p class="font-medium text-sm text-desa-secondary">Jumlah Penduduk</p>
          </div>
          <canvas id="myChart" class="size-[288px] mx-auto"></canvas>
        </div>
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-1">
              <p class="font-medium leading-5 flex">
                <span class="block size-2 rounded-full my-auto bg-desa-dark-green mr-[6px]"></span>
                Pria
              </p>
              <p class="font-medium text-sm text-desa-secondary">Rentang usia: 32-36 tahun</p>
            </div>
            <p class="flex items-center font-medium leading-5">
              114.210
              <img
                src="@/assets/images/icons/user-black.svg"
                class="flex size-[18px] shrink-0 ml-0.5"
                alt="icon"
              />
            </p>
          </div>
          <hr class="border-desa-foreshadow" />
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-1">
              <p class="font-medium leading-5 flex">
                <span class="block size-2 rounded-full my-auto bg-desa-soft-green mr-[6px]"></span>
                Wanita
              </p>
              <p class="font-medium text-sm text-desa-secondary">Rentang usia: 26-31 tahun</p>
            </div>
            <p class="flex items-center font-medium leading-5">
              97.200
              <img
                src="@/assets/images/icons/user-black.svg"
                class="flex size-[18px] shrink-0 ml-0.5"
                alt="icon"
              />
            </p>
          </div>
          <hr class="border-desa-foreshadow" />
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-1">
              <p class="font-medium leading-5 flex">
                <span class="block size-2 rounded-full my-auto bg-desa-orange mr-[6px]"></span>
                Anak-anak
              </p>
              <p class="font-medium text-sm text-desa-secondary">Rentang usia: 6-12 tahun</p>
            </div>
            <p class="flex items-center font-medium leading-5">
              24.300
              <img
                src="@/assets/images/icons/user-black.svg"
                class="flex size-[18px] shrink-0 ml-0.5"
                alt="icon"
              />
            </p>
          </div>
          <hr class="border-desa-foreshadow" />
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-1">
              <p class="font-medium leading-5 flex">
                <span class="block size-2 rounded-full my-auto bg-desa-yellow mr-[6px]"></span>
                Balita
              </p>
              <p class="font-medium text-sm text-desa-secondary">Rentang usia: 0-5 tahun</p>
            </div>
            <p class="flex items-center font-medium leading-5">
              7.290
              <img
                src="@/assets/images/icons/user-black.svg"
                class="flex size-[18px] shrink-0 ml-0.5"
                alt="icon"
              />
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>

  <div id="Dashboard-kepala-keluarga" v-if="user?.role === 'head-of-family'">
    <header class="mb-4">
      <h1 class="font-semibold text-2xl leading-[30px]">Rumah Tangga Stats</h1>
    </header>
    <div class="flex gap-[14px]">
      <div class="flex flex-col gap-[14px] shrink-0 w-[calc(463/1000*100%)]">
        <section id="Bantuan-Sosial" class="flex flex-col gap-6 p-6 gradient-vertical rounded-2xl">
          <img
            src="@/assets/images/icons/bag-orange-background.svg"
            alt="icon"
            class="size-[86px] shrink-0"
          />
          <div class="flex flex-col gap-[12px]">
            <h2 class="font-medium text-sm leading-[17.5px] text-[#DEFF6E]">— Bantuan Sosial</h2>
            <h3 class="font-semibold text-2xl leading-[30px] text-white">
              Dari Desa Untuk Warga ❤️
            </h3>
            <p class="leading-6 text-white">
              Terima bantuan sosial dari desa yang tepat untuk kebutuhan spesifikmu setiap saat.
            </p>
          </div>
          <RouterLink :to="{ name: 'social-assistance' }">
            <div class="flex items-center justify-between px-4 py-[18px] bg-white rounded-2xl">
              <p class="font-medium leading-5 text-desa-dark-green">Ajukan Bantuan Sosial</p>
              <img
                src="@/assets/images/icons/add-square-dark-green.svg"
                alt="icon"
                class="size-6 shrink-0"
              />
            </div>
          </RouterLink>
        </section>
        <section id="Events-Joined" class="flex flex-col gap-6 p-6 bg-white rounded-2xl">
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-[6px]">
              <strong class="font-semibold text-[32px] leading-[40px]">{{
                eventParticipants.length
              }}</strong>
              <h2 class="font-medium leading-5 text-desa-secondary">Events Joined</h2>
            </div>
            <div
              class="p-[12px] rounded-full flex justify-center items-center bg-desa-foreshadow shrink-0"
            >
              <img
                src="@/assets/images/icons/calendar-2-dark-green.svg"
                alt="icon"
                class="size-6 shrink-0"
              />
            </div>
          </div>
          <hr class="border-desa-background" />
          <div id="Recent-Event" class="flex flex-col gap-4">
            <h3 class="font-medium leading-5 text-desa-secondary">Recent Events</h3>
            <div
              class="event py-4 rounded-2xl border border-desa-background flex flex-col gap-4"
              v-for="event in eventParticipants.slice(0, 3)"
            >
              <div class="time px-4 flex items-center justify-between">
                <p class="font-medium text-sm leading-[17.5px] text-desa-secondary">
                  {{ formatToClientTimeZone(event.created_at) }}
                </p>
                <img
                  src="@/assets/images/icons/calendar-2-secondary-green.svg"
                  alt="icon"
                  class="size-[18px] shrink-0"
                />
              </div>
              <hr class="border-desa-background mx-4" />
              <div class="card px-4 flex items-center gap-3">
                <div
                  class="flex items-center justify-center w-[100px] h-[80px] shrink-0 rounded-2xl overflow-auto"
                >
                  <img
                    src="@/assets/images/thumbnails/kk-dashboard-1.png"
                    alt="image"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex flex-col gap-[6px] w-full">
                  <h4 class="font-semibold text-lg leading-[22.5px] line-clamp-1">
                    {{ event.event.name }}
                  </h4>
                  <div class="flex items-center gap-1">
                    <img
                      src="@/assets/images/icons/profile-2user-orange.svg"
                      alt="icon"
                      class="size-[18px] shrink-0"
                    />
                    <p class="font-semibold text-sm leading-[17.5px] text-desa-orange">
                      {{ event.quantity }}
                    </p>
                    <p class="font-semibold text-sm leading-[17.5px] text-desa-orange line-clamp-1">
                      total partisipasi
                    </p>
                  </div>
                </div>
              </div>
              <hr class="border-desa-background" />
              <div class="harga-event px-4 flex items-center justify-between">
                <p class="font-medium text-sm leading-[17.5px] text-desa-secondary">Harga Event:</p>
                <p class="font-medium leading-5 text-desa-red">
                  Rp{{ formatRupiah(event.event.price) }}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="Pembangunan" class="flex flex-col gap-6 p-6 bg-white rounded-2xl">
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-[6px]">
              <strong class="font-semibold text-[32px] leading-[40px]">{{ recentApplicants.length }} Applicants</strong>
              <h2 class="font-medium leading-5 text-desa-secondary">Lamaran</h2>
            </div>
            <div
              class="p-[12px] rounded-full flex justify-center items-center bg-desa-foreshadow shrink-0"
            >
              <img
                src="@/assets/images/icons/calendar-2-dark-green.svg"
                alt="icon"
                class="size-6 shrink-0"
              />
            </div>
          </div>
          <hr class="border-desa-background" />
          <div id="Recent-Applicants" class="flex flex-col gap-4">
            <h3 class="font-medium leading-5 text-desa-secondary">Recent Applicants</h3>
            
            <template v-if="recentApplicants.length > 0">
              <div
                v-for="applicant in recentApplicants.slice(0, 3)"
                :key="applicant.id"
                class="applicant p-4 rounded-2xl border border-desa-background flex flex-col gap-4"
              >
                <div class="flex items-center justify-between">
                  <div
                    class="flex items-center justify-center w-[100px] h-[80px] shrink-0 rounded-2xl overflow-hidden"
                  >
                    <img
                      :src="applicant.job_vacancy?.thumbnail || '/src/assets/images/thumbnails/default-job.jpg'"
                      alt="job thumbnail"
                      class="size-full shrink-0 object-cover"
                    />
                  </div>
                  <div :class="'group ' + applicant.status">
                    <span
                      class="group-[&.pending]:flex hidden rounded-full py-[12px] w-[100px] justify-center bg-desa-yellow text-white font-semibold text-xs leading-[15px] shrink-0"
                      >MENUNGGU</span
                    >
                    <span
                      class="group-[&.rejected]:flex hidden rounded-full py-[12px] w-[100px] justify-center bg-desa-red text-white font-semibold text-xs leading-[15px] shrink-0"
                      >DITOLAK</span
                    >
                    <span
                      class="group-[&.accepted]:flex hidden rounded-full py-[12px] w-[100px] justify-center bg-desa-dark-green text-white font-semibold text-xs leading-[15px] shrink-0"
                      >DITERIMA</span
                    >
                  </div>
                </div>
                <div class="flex flex-col gap-1">
                  <h5 class="font-semibold text-lg leading-[22.5px] line-clamp-1">
                    {{ applicant.job_vacancy?.job_title || 'N/A' }}
                  </h5>
                  <div class="flex gap-1">
                    <p class="font-medium leading-5 text-desa-secondary">Perusahaan:</p>
                    <p class="font-semibold leading-5 text-desa-dark-green">{{ applicant.job_vacancy?.company_in_charge || 'N/A' }}</p>
                  </div>
                </div>
                <hr class="border-desa-background" />
                <div id="Tanggal-Pelaksanaan" class="flex items-center gap-[12px]">
                  <div
                    class="size-[48px] shrink-0 rounded-full bg-desa-foreshadow flex items-center justify-center"
                  >
                    <img
                      src="@/assets/images/icons/calendar-2-dark-green.svg"
                      alt="icon"
                      class="size-6 shrink-0"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <p class="font-semibold leading-5 text-desa-dark-green">
                      {{ applicant.job_vacancy?.start_date ? new Date(applicant.job_vacancy.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A' }}
                    </p>
                    <h6 class="font-medium text-sm leading-[17.5px] text-desa-secondary">
                      Tanggal Mulai
                    </h6>
                  </div>
                </div>
                <hr class="border-desa-background" />
                <div id="Waktu-Pelaksanaan" class="flex items-center gap-[12px]">
                  <div
                    class="size-[48px] shrink-0 rounded-full bg-desa-foreshadow flex items-center justify-center"
                  >
                    <img
                      src="@/assets/images/icons/timer-dark-green.svg"
                      alt="icon"
                      class="size-6 shrink-0"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <p class="font-semibold leading-5 text-desa-dark-green">
                      {{ applicant.job_vacancy?.start_date ? calculateDaysUntil(applicant.job_vacancy.start_date) + ' Hari' : 'N/A' }}
                    </p>
                    <h6 class="font-medium text-sm leading-[17.5px] text-desa-secondary">
                      Waktu Pelaksanaan
                    </h6>
                  </div>
                </div>
              </div>
            </template>
            
            <div
              v-else
              class="m-auto h-[280px] flex flex-col shrink-0 justify-center items-center gap-6"
            >
              <img
                src="@/assets/images/icons/note-remove-secondary.svg"
                class="flex size-[52px] shrink-0"
                alt="icon"
              />
              <p class="font-medium leading-5 text-center text-desa-secondary">
                Belum ada lamaran kerja
              </p>
            </div>
          </div>
        </section>
      </div>
      <div class="flex flex-col gap-[14px] flex-1">
        <section id="Anggota-Keluarga" class="flex flex-col gap-6 p-6 bg-white rounded-2xl">
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-[6px]">
              <strong class="font-semibold text-[32px] leading-[40px]">{{
                familyMembers.length
              }}</strong>
              <h2 class="font-medium leading-5 text-desa-secondary">Anggota Keluarga</h2>
            </div>
            <div
              class="p-[16px] rounded-full flex justify-center items-center bg-desa-foreshadow shrink-0"
            >
              <img
                src="@/assets/images/icons/profile-2user-dark-green.svg"
                alt="icon"
                class="size-6 shrink-0"
              />
            </div>
          </div>
          <div class="box h-[1px] w-full"></div>
          <div class="people flex flex-col gap-[14px]" v-for="familyMember in familyMembers">
            <div class="rounded-2xl border border-desa-background p-4 flex flex-col gap-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-[12px]">
                  <div
                    class="flex size-[64px] shrink-0 rounded-full overflow-hidden bg-desa-foreshadow"
                  >
                    <img
                      :src="familyMember.profile_picture"
                      class="w-full h-full object-cover"
                      alt="photo"
                    />
                  </div>
                  <div class="flex flex-col gap-[6px]">
                    <h4 class="font-semibold text-lg leading-[22.5px] line-clamp-1">
                      {{ familyMember.user?.name }}
                    </h4>
                    <div class="flex items-center gap-1">
                      <img
                        src="@/assets/images/icons/briefcase-secondary-green.svg"
                        alt="icon"
                        class="size-[18px] shrink-0"
                      />
                      <p class="font-medium leading-5 text-desa-secondary line-clamp-1">
                        {{ familyMember.occupation }}
                      </p>
                    </div>
                  </div>
                </div>
                <p class="font-medium leading-5">
                  {{ calculateAge(familyMember.date_of_birth) }} tahun
                </p>
              </div>
              <hr class="border-desa-foreshadow" />
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1">
                  <img
                    src="@/assets/images/icons/keyboard-secondary-green.svg"
                    alt="icon"
                    class="size-[18px] shrink-0"
                  />
                  <p class="font-medium text-sm leading-[17.5px] text-desa-secondary">
                    {{ familyMember.identity_number }}
                  </p>
                </div>
                <p class="font-medium leading-5">27192018210818291</p>
              </div>
            </div>
          </div>
          <a href="kk-anggota-keluarga.html">
            <div class="rounded-2xl py-[18px] bg-desa-dark-green flex justify-center items-center">
              <p class="font-medium leading-5 text-white">View Details</p>
            </div>
          </a>
        </section>
        <section id="Pengajuan-Bantuan-Sosial" class="flex flex-col gap-6 p-6 bg-white rounded-2xl">
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-[6px]">
              <strong class="font-semibold text-[32px] leading-[40px]"
                >{{ socialAssistanceRecipients.length }} Pengajuan</strong
              >
              <h2 class="font-medium leading-5 text-desa-secondary">Bantuan Sosial</h2>
            </div>
            <div
              class="p-[16px] rounded-full flex justify-center items-center bg-desa-foreshadow shrink-0"
            >
              <img
                src="@/assets/images/icons/note-dark-green.svg"
                alt="icon"
                class="size-6 shrink-0"
              />
            </div>
          </div>
          <div class="box h-[1px] w-full"></div>
          <div class="people flex flex-col gap-4">
            <h3 class="font-medium leading-5 text-desa-secondary">Recent Bansos</h3>
            <div
              class="bantuan p-4 rounded-2xl border border-desa-background flex flex-col gap-4"
              v-for="recipient in socialAssistanceRecipients.slice(0, 3)"
            >
              <div class="flex items-center justify-between">
                <p class="font-medium text-sm leading-[17.5px] text-desa-secondary">
                  {{ formatToClientTimeZone(recipient.created_at) }}
                </p>
                <img
                  src="@/assets/images/icons/calendar-2-secondary-green.svg"
                  alt="icon"
                  class="size-[18px] shrink-0"
                />
              </div>
              <hr class="border-desa-background" />
              <h4 class="font-semibold text-lg leading-[22.5px]">
                {{ recipient.social_assistance?.name }}
              </h4>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="size-[52px] shrink-0 rounded-2xl flex justify-center items-center bg-desa-foreshadow"
                  >
                    <img
                      src="@/assets/images/icons/money-dark-green.svg"
                      alt="icon"
                      class="size-6 shrink-0"
                    />
                  </div>
                  <div class="flex flex-col gap-[6px]">
                    <h5 class="font-semibold text-lg leading-[22.5px]">
                      Rp{{ formatRupiah(recipient.amount) }}
                    </h5>
                    <p class="font-medium text-sm leading-[17.5px] text-desa-secondary">
                      Nominal Pengajuan
                    </p>
                  </div>
                </div>
                <div class="group {{ recipient.status }}">
                  <span
                    class="group-[&.pending]:flex hidden rounded-full py-[12px] w-[100px] justify-center bg-desa-yellow text-white font-semibold text-xs leading-[15px] shrink-0"
                    >MENUNGGU</span
                  >
                  <span
                    class="group-[&.rejected]:flex hidden rounded-full py-[12px] w-[100px] justify-center bg-desa-red text-white font-semibold text-xs leading-[15px] shrink-0"
                    >DITOLAK</span
                  >
                  <span
                    class="group-[&.approved]:flex hidden rounded-full py-[12px] w-[100px] justify-center bg-desa-dark-green text-white font-semibold text-xs leading-[15px] shrink-0"
                    >DITERIMA</span
                  >
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          id="Unduh-Rumah-Tangga-Stat"
          class="rounded-2xl gradient-horizontal pt-[32px] px-[32px] pb-[34px] flex flex-col gap-[32px]"
        >
          <div class="flex items-center gap-4">
            <img
              src="@/assets/images/icons/document-download-orange-background.svg"
              alt="icon"
              class="size-[86px] shrink-0"
            />
            <div class="flex flex-col gap-[6px]">
              <h2 class="font-medium text-sm leading-[17.5px] text-desa-lime">
                — Unduh Rumah Tangga Stat
              </h2>
              <strong class="font-semibold text-2xl leading-[30px] text-white"
                >Statistik Rumah Tangga</strong
              >
            </div>
          </div>
          <button
            type="button"
            @click="downloadFamilyReport"
            class="flex items-center justify-between px-4 py-[18px] bg-white rounded-2xl hover:bg-desa-foreshadow transition-colors"
            :disabled="loadingFamilyMember"
          >
            <p class="font-medium leading-5 text-desa-dark-green">
              {{ loadingFamilyMember ? 'Downloading...' : 'Download Laporan' }}
            </p>
            <img
              src="@/assets/images/icons/receive-square-dark-green.svg"
              alt="icon"
              class="size-6 shrink-0"
            />
          </button>
        </section>
      </div>
    </div>
  </div>
</template>
