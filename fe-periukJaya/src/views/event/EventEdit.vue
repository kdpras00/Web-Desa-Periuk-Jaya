<script setup>
import { formatRupiah, parseRupiah } from '@/helpers/format'
import IconEditSecondaryGreen from '@/assets/images/icons/edit-secondary-green.svg'
import IconEditBlack from '@/assets/images/icons/edit-black.svg'
import { useEventStore } from '@/stores/event'
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
const route = useRoute()

const event = ref({
  id: null,
  thumbnail: null,
  thumbnail_url: null,
  name: null,
  description: null,
  price: null,
  date: null,
  time: null,
  is_active: null,
})
const eventStore = useEventStore()
const { loading, error, success } = storeToRefs(eventStore)
const { fetchEvent, updateEvent } = eventStore

const fetchData = async () => {
  const response = await fetchEvent(route.params.id)

  event.value = {
    ...response,
    thumbnail_url: response.thumbnail || '',
    thumbnail: null, // Will be set when user uploads new file
    name: response.name || '',
    description: response.description || '',
    price: response.price ? String(response.price) : '',
    date: response.date || '',
    time: response.time || '',
    is_active: response.is_active ? '1' : '0',
  }
}

const handleSubmit = async () => {
  // Validate required fields (thumbnail not required for update if already exists)
  if (!event.value.name) {
    alert('Nama event harus diisi!')
    return
  }
  if (!event.value.description) {
    alert('Deskripsi event harus diisi!')
    return
  }
  if (!event.value.price) {
    alert('Harga event harus diisi!')
    return
  }
  if (!event.value.date) {
    alert('Tanggal event harus diisi!')
    return
  }
  if (!event.value.time) {
    alert('Waktu event harus diisi!')
    return
  }

  const payload = {
    ...event.value,
    price: parseRupiah(event.value.price) || 0,
    is_active: event.value.is_active === '1' ? 1 : 0,
  }
  
  console.log('Updating event with payload:', payload)
  await updateEvent(payload)
}

const handleImageChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    event.value.thumbnail = file
    event.value.thumbnail_url = URL.createObjectURL(file)
  }
}

watch(
  () => event.value.price,
  (newPrice) => {
    event.value.price = formatRupiah(newPrice)
  },
)
onMounted(fetchData)
</script>

<template>
  <div id="Header" class="flex items-center justify-between">
    <div class="flex flex-col gap-2">
      <div class="flex gap-1 items-center leading-5 text-desa-secondary">
        <p class="last-of-type:text-desa-dark-green last-of-type:font-semibold capitalize">Event</p>
        <span>/</span>
        <p class="last-of-type:text-desa-dark-green last-of-type:font-semibold capitalize">
          Edit Event Desa
        </p>
      </div>
      <h1 class="font-semibold text-2xl">Edit Event</h1>
    </div>
  </div>
  <form @submit.prevent="handleSubmit" id="myForm" class="capitalize">
    <div class="shrink-0 rounded-3xl p-6 bg-white flex flex-col gap-6 h-fit">
      <section id="Thumbnail" class="flex items-center justify-between">
        <h2 class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Thumbnail Event
        </h2>
        <div class="flex-1 flex items-center justify-between">
          <div
            id="Photo-Preview"
            class="flex itce justify-center w-[120px] h-[100px] rounded-2xl overflow-hidden bg-desa-foreshadow"
          >
            <img id="Photo" :src="event.thumbnail_url" alt="image" class="size-full object-cover" />
          </div>
          <div class="relative">
            <input
              id="File"
              type="file"
              name="file"
              accept="image/jpeg,image/png,image/jpg"
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
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">Nama Event</p>
        <div class="flex flex-col gap-3 flex-1 shrink-0">
          <Input
            v-model="event.name"
            type="text"
            placeholder="Ketik Job Title Kamu"
            :error-message="error?.name"
            :icon="IconEditSecondaryGreen"
            :filled-icon="IconEditBlack"
          />
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Penanggung-Jawab" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">Harga</p>
        <div class="flex flex-col gap-3 flex-1 shrink-0">
          <Input
            v-model="event.price"
            type="text"
            placeholder="Ketik Biaya Event"
            :error-message="error?.price"
            :icon="IconDollarSquareSecondaryGreen"
            :filled-icon="IconDollarSquareBlack"
          />
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Status" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">Status Event</p>
        <div class="flex flex-1 gap-6 shrink-0">
          <label
            class="group flex w-full items-center h-14 rounded-2xl p-4 ring-[1.5px] ring-desa-background gap-2 has-[:checked]:ring-none has-[:checked]:bg-desa-foreshadow transition-setup"
          >
            <input
              v-model="event.is_active"
              value="1"
              type="radio"
              name="status"
              id=""
              class="flex size-[18px] shrink-0 accent-desa-secondary checked:accent-desa-dark-green transition-setup"
            />
            <span
              class="font-medium leading-5 text-desa-secondary w-full group-has-[:checked]:text-desa-dark-green transition-setup"
            >
              Open
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
              v-model="event.is_active"
              value="0"
              type="radio"
              name="status"
              id=""
              class="flex size-[18px] shrink-0 accent-desa-secondary checked:accent-desa-dark-green transition-setup"
            />
            <span
              class="font-medium leading-5 text-desa-secondary w-full group-has-[:checked]:text-desa-dark-green transition-setup"
            >
              Closed
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
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Tanggal-Pembangunan" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Tanggal Event
        </p>
        <div class="flex items-center gap-6 flex-1 shrink-0">
          <label class="relative group peer w-full">
            <Input
              v-model="event.date"
              type="date"
              placeholder="Pilih Tanggal Awal"
              :error-message="error?.date"
              :icon="IconCalendarSecondaryGreen"
              :filled-icon="IconCalendarBlack"
            />
          </label>
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Tanggal-Pembangunan" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">Waktu Event</p>
        <div class="flex items-center gap-6 flex-1 shrink-0">
          <label class="relative group peer w-full">
            <Input
              v-model="event.time"
              type="time"
              placeholder="Pilih Waktu"
              :error-message="error?.time"
              :icon="IconCalendarSecondaryGreen"
              :filled-icon="IconCalendarBlack"
            />
          </label>
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Deskripsi" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Deskripsi Event
        </p>
        <div class="flex flex-col gap-3 flex-1 shrink-0">
          <textarea
            v-model="event.description"
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
        <RouterLink :to="{ name: 'manage-event', params: { id: event.id } }">
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
