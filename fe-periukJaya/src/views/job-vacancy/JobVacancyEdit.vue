<script setup>
import { formatRupiah, formatToClientTimeZone, parseRupiah } from '@/helpers/format'
import IconEditSecondaryGreen from '@/assets/images/icons/edit-secondary-green.svg'
import IconEditBlack from '@/assets/images/icons/edit-black.svg'
import { useJobVacancyStore } from '@/stores/jobVacancy'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import IconProfileCircleSecondaryGreen from '@/assets/images/icons/profile-circle-secondary-green.svg'
import IconProfileCircleBlack from '@/assets/images/icons/profile-circle-black.svg'
import IconCalendarSecondaryGreen from '@/assets/images/icons/calendar-2-secondary-green.svg'
import IconCalendarBlack from '@/assets/images/icons/calendar-2-black.svg'
import IconDollarSquareSecondaryGreen from '@/assets/images/icons/dollar-square-secondary-green.svg'
import IconDollarSquareBlack from '@/assets/images/icons/dollar-square-black.svg'
import Input from '@/components/ui/Input.vue'
import { usePreventNonNumeric } from '@/composables/useFormHelpers'

const route = useRoute()
const { preventNonNumeric } = usePreventNonNumeric()

const jobVacancy = ref({
  id: null,
  thumbnail: null,
  thumbnail_url: '',
  job_title: '',
  description: '',
  company_in_charge: '',
  start_date: '',
  day: 0,
  end_date: '',
  salary: '',
  job_status: 'open',
})
const jobVacancyStore = useJobVacancyStore()
const { loading, error, success } = storeToRefs(jobVacancyStore)
const { fetchJobVacancy, updateJobVacancy } = jobVacancyStore

const fetchData = async () => {
  const response = await fetchJobVacancy(route.params.id)

  jobVacancy.value = {
    ...response,
    thumbnail_url: response.thumbnail || '',
    thumbnail: null, // Will be set when user uploads new file
    job_title: response.job_title || '',
    description: response.description || '',
    company_in_charge: response.company_in_charge || '',
    start_date: response.start_date || '',
    end_date: response.end_date || '',
    salary: response.salary ? String(response.salary) : '',
    job_status: response.job_status || 'open',
    day: Math.round(
      (new Date(response.end_date).getTime() - new Date(response.start_date).getTime()) /
        (24 * 60 * 60 * 1000),
    )
  }
}

const handleSubmit = async () => {
  // Parse salary to integer (backend requires integer)
  const salaryValue = jobVacancy.value.salary ? parseRupiah(jobVacancy.value.salary) : 0
  
  await updateJobVacancy({
    ...jobVacancy.value,
    salary: Math.floor(salaryValue || 0),
  })
}

const handleImageChange = (event) => {
  const file = event.target.files[0]
  jobVacancy.value.thumbnail = file
  jobVacancy.value.thumbnail_url = URL.createObjectURL(file)
}

watch(
  () => jobVacancy.value.salary,
  (newSalary) => {
    jobVacancy.value.salary = formatRupiah(newSalary)
  },
)

watch(
  () => jobVacancy.value.day,
  (newDay) => {
    jobVacancy.value.day = newDay
    jobVacancy.value.end_date = new Date(
      new Date(jobVacancy.value.start_date).getTime() + newDay * 24 * 60 * 60 * 1000,
    )
      .toISOString()
      .split('T')[0]
  },
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
          Edit Job Vacancy
        </p>
      </div>
      <h1 class="font-semibold text-2xl">Edit Job Vacancy</h1>
    </div>
  </div>
  <form @submit.prevent="handleSubmit" id="myForm" class="capitalize">
    <div class="shrink-0 rounded-3xl p-6 bg-white flex flex-col gap-6 h-fit">
      <section id="Thumbnail" class="flex items-center justify-between">
        <h2 class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Thumbnail Perusahaan
        </h2>
        <div class="flex-1 flex items-center justify-between">
          <div
            id="Photo-Preview"
            class="flex itce justify-center w-[120px] h-[100px] rounded-2xl overflow-hidden bg-desa-foreshadow"
          >
            <img
              id="Photo"
              :src="jobVacancy.thumbnail_url"
              alt="image"
              class="size-full object-cover"
            />
          </div>
          <div class="relative">
            <input
              id="File"
              type="file"
              name="file"
              class="absolute opacity-0 left-0 w-full top-0 h-full"
              @change="handleImageChange"
              ref="thumbnail"
            />
            <button
              id="Upload"
              type="button"
              class="relative flex items-center py-4 px-6 rounded-2xl bg-desa-black gap-[10px]"
              @click="$refs.thumbnail.click()"
            >
              <img
                src="@/assets/images/icons/send-square-white.svg"
                alt="icon"
                class="size-6 shrink-0"
              />
              <p class="font-medium leading-5 text-white">Upload</p>
            </button>
          </div>
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Nama-Projek" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Lowongan Yang Tersedia
        </p>
        <div class="flex flex-col gap-3 flex-1 shrink-0">
          <Input
            v-model="jobVacancy.job_title"
            type="text"
            placeholder="Ketik Job Title Kamu"
            :error-message="error?.job_title"
            :icon="IconEditSecondaryGreen"
            :filled-icon="IconEditBlack"
          />
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Penanggung-Jawab" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Penanggung Jawab
        </p>
        <div class="flex flex-col gap-3 flex-1 shrink-0">
          <Input
            v-model="jobVacancy.company_in_charge"
            type="text"
            placeholder="Company Yang Bertanggung Jawab"
            :error-message="error?.company_in_charge"
            :icon="IconProfileCircleSecondaryGreen"
            :filled-icon="IconProfileCircleBlack"
          />
        </div>
      </section>

      <hr class="border-desa-background" />
      <section id="Penanggung-Jawab" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">Jumlah Gaji</p>
        <div class="flex flex-col gap-3 flex-1 shrink-0">
          <Input
            v-model="jobVacancy.salary"
            type="text"
            placeholder="Masukan Jumlah Gaji"
            :error-message="error?.salary"
            :icon="IconDollarSquareSecondaryGreen"
            :filled-icon="IconDollarSquareBlack"
          />
        </div>
      </section>

      <hr class="border-desa-background" />
      <section id="Status" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">Status loker</p>
        <div class="flex flex-1 gap-6 shrink-0">
          <label
            class="group flex w-full items-center h-14 rounded-2xl p-4 ring-[1.5px] ring-desa-background gap-2 has-[:checked]:ring-none has-[:checked]:bg-desa-foreshadow transition-setup"
          >
            <input
              v-model="jobVacancy.job_status"
              value="open"
              type="radio"
              name="status"
              id=""
              class="flex size-[18px] shrink-0 accent-desa-secondary checked:accent-desa-dark-green transition-setup"
            />
            <span
              class="font-medium leading-5 text-desa-secondary w-full group-has-[:checked]:text-desa-dark-green transition-setup"
            >
              Buka
            </span>
            <div class="flex size-6 shrink-0">
              <img
                src="@/assets/images/icons/tick-circle-secondary-green.svg"
                class="size-6 flex group-has-[:checked]:hidden"
                alt="icon"
              />
              <img
                src="@/assets/images/icons/tick-circle-dark-green.svg"
                class="size-6 hidden group-has-[:checked]:flex"
                alt="icon"
              />
            </div>
          </label>
          <label
            class="group flex w-full items-center h-14 rounded-2xl p-4 ring-[1.5px] ring-desa-background gap-2 has-[:checked]:ring-none has-[:checked]:bg-desa-foreshadow transition-setup"
          >
            <input
              v-model="jobVacancy.job_status"
              value="closed"
              type="radio"
              name="status"
              id=""
              class="flex size-[18px] shrink-0 accent-desa-secondary checked:accent-desa-dark-green transition-setup"
            />
            <span
              class="font-medium leading-5 text-desa-secondary w-full group-has-[:checked]:text-desa-dark-green transition-setup"
            >
              Tutup
            </span>
            <div class="flex size-6 shrink-0">
              <img
                src="@/assets/images/icons/close-circle-secondary-green.svg"
                class="size-6 flex group-has-[:checked]:hidden"
                alt="icon"
              />
              <img
                src="@/assets/images/icons/close-circle-secondary-green.svg"
                class="size-6 hidden group-has-[:checked]:flex"
                alt="icon"
              />
            </div>
          </label>
          <label
            class="group flex w-full items-center h-14 rounded-2xl p-4 ring-[1.5px] ring-desa-background gap-2 has-[:checked]:ring-none has-[:checked]:bg-desa-foreshadow transition-setup"
          >
            <input
              v-model="jobVacancy.job_status"
              value="filled"
              type="radio"
              name="status"
              id=""
              class="flex size-[18px] shrink-0 accent-desa-secondary checked:accent-desa-dark-green transition-setup"
            />
            <span
              class="font-medium leading-5 text-desa-secondary w-full group-has-[:checked]:text-desa-dark-green transition-setup"
            >
              Terisi
            </span>
            <div class="flex size-6 shrink-0">
              <img
                src="@/assets/images/icons/tick-circle-secondary-green.svg"
                class="size-6 flex group-has-[:checked]:hidden"
                alt="icon"
              />
              <img
                src="@/assets/images/icons/tick-circle-dark-green.svg"
                class="size-6 hidden group-has-[:checked]:flex"
                alt="icon"
              />
            </div>
          </label>
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Tanggal-Pembangunan" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Tanggal Pelaksanaan
        </p>
        <div class="flex items-center gap-6 flex-1 shrink-0">
          <label class="relative group peer w-full">
            <Input
              v-model="jobVacancy.start_date"
              type="date"
              placeholder="Pilih Tanggal Pembukaan Lowongan"
              :error-message="error?.start_date"
              :icon="IconCalendarSecondaryGreen"
              :filled-icon="IconCalendarBlack"
            />
          </label>
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Hari" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">Batas waktu</p>
        <div class="flex flex-col gap-3 flex-1 shrink-0">
          <label class="relative group peer w-full">
            <input
              v-model="jobVacancy.day"
              type="number"
              @keydown="preventNonNumeric"
              placeholder="Ketik hari yang dibutuhkan"
              class="appearance-none outline-none w-full h-14 rounded-2xl ring-[1.5px] ring-desa-background focus:ring-desa-black py-4 px-12 pr-[98px] gap-2 font-medium placeholder:text-desa-secondary transition-all duration-300"
            />
            <div class="absolute transform -translate-y-1/2 top-1/2 left-4 flex size-6 shrink-0">
              <img
                src="@/assets/images/icons/timer-secondary-green.svg"
                class="size-6 hidden group-has-[:placeholder-shown]:flex"
                alt="icon"
              />
              <img
                src="@/assets/images/icons/timer-black.svg"
                class="size-6 flex group-has-[:placeholder-shown]:hidden"
                alt="icon"
              />
            </div>
            <div class="absolute transform -translate-y-1/2 top-1/2 right-4 flex shrink-0 gap-6">
              <div class="w-px h-6 border border-desa-background"></div>
              <span
                class="font-medium leading-5 text-desa-dark-green group-has-[:placeholder-shown]:text-desa-secondary"
                >Hari</span
              >
            </div>
          </label>
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Deskripsi" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Deskripsi lowongan
        </p>
        <div class="flex flex-col gap-3 flex-1 shrink-0">
          <textarea
            v-model="jobVacancy.description"
            name=""
            id=""
            placeholder="Jelaskan detail lowongan"
            rows="6"
            class="appearance-none outline-none w-full rounded-2xl ring-[1.5px] ring-desa-background focus:ring-desa-black py-4 px-4 gap-2 font-medium placeholder:text-desa-secondary transition-all duration-300"
          >
 Jelaskan detail lowongan
                                    </textarea
          >
        </div>
      </section>
      <hr class="border-desa-background w-[calc(100%+48px)] -mx-6" />
      <section id="Buttons" class="flex items-center justify-end gap-4">
        <RouterLink :to="{ name: 'manage-job-vacancy', params: { id: jobVacancy.id } }">
          <div
            class="py-[18px] rounded-2xl bg-desa-red w-[180px] text-center flex justify-center font-medium text-white"
          >
            Batal, Tidak jadi
          </div>
        </RouterLink>
        <button
          id="submitButton"
          type="submit"
          class="py-[18px] rounded-2xl disabled:bg-desa-grey w-[180px] text-center flex justify-center font-medium text-white bg-desa-dark-green transition-all duration-300"
        >
          Save Changes
        </button>
      </section>
    </div>
  </form>
</template>
