<script setup>
import { useFamilyMemberStore } from '@/stores/familyMember'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import Input from '@/components/ui/Input.vue'
import IconProfileSecondaryGreen from '@/assets/images/icons/user-secondary-green.svg'
import IconProfileBlack from '@/assets/images/icons/user-black.svg'
import IconKeyboardSecondaryGreen from '@/assets/images/icons/keyboard-secondary-green.svg'
import IconKeyboardBlack from '@/assets/images/icons/keyboard-black.svg'
import IconCallSecondaryGreen from '@/assets/images/icons/call-secondary-green.svg'
import IconCallBlack from '@/assets/images/icons/call-black.svg'
import IconBriefCaseSecondaryGreen from '@/assets/images/icons/briefcase-secondary-green.svg'
import IconBriefCaseBlack from '@/assets/images/icons/briefcase-black.svg'
import IconCalendarSecondaryGreen from '@/assets/images/icons/calendar-2-secondary-green.svg'
import IconCalendarBlack from '@/assets/images/icons/calendar-2-black.svg'
import IconKeySecondaryGreen from '@/assets/images/icons/key-secondary-green.svg'
import IconKeyBlack from '@/assets/images/icons/key-black.svg'
import { useDeleteConfirmation, usePreventNonNumeric } from '@/composables/useFormHelpers'
import router from '@/router'

const familyMemberStore = useFamilyMemberStore()
const { loading, error } = storeToRefs(familyMemberStore)
const { createFamilyMember } = familyMemberStore
const { showSuccess, showError } = useDeleteConfirmation()
const { preventNonNumeric } = usePreventNonNumeric()
const familyMember = ref({
  name: null,
  email: null,
  password: null,
  profile_picture: null,
  profile_picture_url: null,
  identity_number: null,
  gender: null,
  date_of_birth: null,
  age: null,
  phone_number: null,
  occupation: null,
  marital_status: null,
  relation: null,
})

const handleSubmit = async () => {
  try {
    await createFamilyMember(familyMember.value)
    // Wait for user to click OK on success alert, then redirect
    await showSuccess('Anggota keluarga berhasil ditambahkan!')
    router.push({ name: 'head-of-family' })
  } catch (error) {
    // Format error message for display
    let errorMessage = 'Gagal menambahkan anggota keluarga'

    if (error?.response?.data?.errors) {
      // If it's a validation error (422), format the error messages
      const errors = error.response.data.errors

      // Collect all error messages from all fields
      const allErrorMessages = []

      // Check each field and add its errors
      if (errors.email && errors.email.length > 0) {
        allErrorMessages.push(`Email: ${errors.email.join(', ')}`)
      }
      if (errors.identity_number && errors.identity_number.length > 0) {
        allErrorMessages.push(`NIK: ${errors.identity_number.join(', ')}`)
      }
      if (errors.name && errors.name.length > 0) {
        allErrorMessages.push(`Nama: ${errors.name.join(', ')}`)
      }
      if (errors.password && errors.password.length > 0) {
        allErrorMessages.push(`Password: ${errors.password.join(', ')}`)
      }
      if (errors.profile_picture && errors.profile_picture.length > 0) {
        allErrorMessages.push(`Foto Profil: ${errors.profile_picture.join(', ')}`)
      }
      if (errors.gender && errors.gender.length > 0) {
        allErrorMessages.push(`Jenis Kelamin: ${errors.gender.join(', ')}`)
      }
      if (errors.date_of_birth && errors.date_of_birth.length > 0) {
        allErrorMessages.push(`Tanggal Lahir: ${errors.date_of_birth.join(', ')}`)
      }
      if (errors.phone_number && errors.phone_number.length > 0) {
        allErrorMessages.push(`Nomor Handphone: ${errors.phone_number.join(', ')}`)
      }
      if (errors.occupation && errors.occupation.length > 0) {
        allErrorMessages.push(`Pekerjaan: ${errors.occupation.join(', ')}`)
      }
      if (errors.marital_status && errors.marital_status.length > 0) {
        allErrorMessages.push(`Status: ${errors.marital_status.join(', ')}`)
      }
      if (errors.relation && errors.relation.length > 0) {
        allErrorMessages.push(`Hubungan: ${errors.relation.join(', ')}`)
      }

      // If we collected specific errors, use them
      if (allErrorMessages.length > 0) {
        errorMessage = allErrorMessages.join('\n')
      } else {
        // Fallback: use all errors
        const errorMessages = Object.values(errors).flat()
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join('\n')
        }
      }
    } else if (error?.response?.data?.message) {
      // Use message from backend if available
      errorMessage = error.response.data.message
    } else if (error?.message) {
      errorMessage = error.message
    }

    await showError(errorMessage)
  }
}

const handleImageChange = (event) => {
  const file = event.target.files[0]
  familyMember.value.profile_picture = file
  familyMember.value.profile_picture_url = URL.createObjectURL(file)
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

// watch digunakan untuk melihat perubahan pada date_of_birth dalam familyMember
watch(
  () => familyMember.value.date_of_birth,
  (newDate) => {
    familyMember.value.age = calculateAge(newDate)
  },
)
</script>

<template>
  <div id="Header" class="flex items-center justify-between">
    <div class="flex flex-col gap-2">
      <div class="flex gap-1 items-center leading-5 text-desa-secondary">
        <p class="last-of-type:text-desa-dark-green last-of-type:font-semibold capitalize">
          Anggota Keluarga
        </p>
        <span>/</span>
        <p class="last-of-type:text-desa-dark-green last-of-type:font-semibold capitalize">
          Tambah Anggota Keluarga
        </p>
      </div>
      <h1 class="font-semibold text-2xl">Tambah Anggota Keluarga Baru</h1>
    </div>
  </div>
  <form @submit.prevent="handleSubmit" id="myForm" class="capitalize">
    <div class="shrink-0 rounded-3xl p-6 bg-white flex flex-col gap-6 h-fit">
      <section id="Photo-Profile" class="flex items-center justify-between">
        <h2 class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Profile Anggota Keluarga
        </h2>
        <div class="flex-1 flex items-center justify-between">
          <div
            id="Photo-Preview"
            class="flex itce justify-center size-[100px] rounded-full overflow-hidden bg-desa-foreshadow"
          >
            <img
              v-if="familyMember.profile_picture_url"
              id="Photo"
              :src="familyMember.profile_picture_url"
              alt="image"
              class="size-full object-cover"
            />
            <span v-else class="text-xs text-desa-secondary text-center px-2">Belum ada foto</span>
          </div>
          <div class="relative">
            <input
              required
              id="File"
              type="file"
              name="file"
              class="absolute opacity-0 left-0 w-full top-0 h-full"
              @change="handleImageChange"
              ref="profile_picture"
            />
            <button
              id="Upload"
              type="button"
              class="relative flex items-center py-4 px-6 rounded-2xl bg-desa-black gap-[10px]"
              @click="$refs.profile_picture.click()"
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
      <section id="Nama-Kepala-Rumah" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Nama Anggota Keluarga
        </p>
        <div class="flex flex-col gap-3 flex-1 shrink-0">
          <Input
            v-model="familyMember.name"
            type="text"
            placeholder="Ketik Nama Kamu"
            :error-message="error?.name"
            :icon="IconProfileSecondaryGreen"
            :filled-icon="IconProfileBlack"
          />
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="NIK" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Nomor Induk Kependudukan
        </p>
        <div class="flex flex-col gap-3 flex-1 shrink-0">
          <Input
            v-model="familyMember.identity_number"
            type="text"
            placeholder="Ketik Nik Kamu (16 digit)"
            :error-message="error?.identity_number"
            :icon="IconKeyboardSecondaryGreen"
            :filled-icon="IconKeyboardBlack"
            :maxlength="16"
            @onKeydown="preventNonNumeric"
          />
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Phone" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Nomor Handphone
        </p>
        <div class="flex flex-col gap-3 flex-1 shrink-0">
          <Input
            v-model="familyMember.phone_number"
            type="text"
            placeholder="Ketik Nomor Handphone Kamu"
            :error-message="error?.phone_number"
            :icon="IconCallSecondaryGreen"
            :filled-icon="IconCallBlack"
            @onKeydown="preventNonNumeric"
          />
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Pekerjaan" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">Pekerjaan</p>
        <div class="flex flex-col gap-3 flex-1 shrink-0">
          <Input
            v-model="familyMember.occupation"
            type="text"
            placeholder="Ketik Pekerjaan Kamu"
            :error-message="error?.occupation"
            :icon="IconBriefCaseSecondaryGreen"
            :filled-icon="IconBriefCaseBlack"
          />
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Tanggal-Lahir" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Tanggal Lahir
        </p>
        <div class="flex items-center gap-6 flex-1 shrink-0">
          <label class="relative group peer w-full valid">
            <Input
              v-model="familyMember.date_of_birth"
              type="date"
              placeholder="Pilih Tanggal Lahir Kamu"
              :error-message="error?.date_of_birth"
              :icon="IconCalendarSecondaryGreen"
              :filled-icon="IconCalendarBlack"
            />
          </label>
          <div
            class="w-[180px] flex shrink-0 h-[52px] rounded-2xl bg-desa-foreshadow p-4 font-medium leading-5 text-desa-dark-green justify-center"
          >
            <p>
              Umur: <span id="Age">{{ familyMember.age }}</span> tahun
            </p>
          </div>
        </div>
      </section>
      <hr class="border-desa-background" />

      <!-- section form jenis kelamin start -->
      <section id="Jenis-Kelamin" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Jenis Kelamin
        </p>
        <div class="flex flex-1 gap-6 shrink-0">
          <!-- radio button male start -->
          <label
            class="group flex w-full items-center h-14 rounded-2xl p-4 ring-[1.5px] ring-desa-background gap-2 has-[:checked]:ring-desa-dark-green transition-setup"
          >
            <input
              type="radio"
              name="gender"
              id="gender-male"
              class="flex size-[18px] shrink-0 accent-desa-secondary checked:accent-desa-dark-green transition-setup"
              v-model="familyMember.gender"
              value="male"
            />
            <span
              class="font-medium leading-5 text-desa-secondary w-full group-has-[:checked]:text-desa-dark-green transition-setup"
            >
              Pria
            </span>
            <div class="flex size-6 shrink-0">
              <img
                src="@/assets/images/icons/man-secondary-green.svg"
                class="size-6 flex group-has-[:checked]:hidden"
                alt="icon"
              />
              <img
                src="@/assets/images/icons/man-dark-green.svg"
                class="size-6 hidden group-has-[:checked]:flex"
                alt="icon"
              />
            </div>
          </label>
          <!-- radio button pria end -->

          <!-- radio button female start -->
          <label
            class="group flex w-full items-center h-14 rounded-2xl p-4 ring-[1.5px] ring-desa-background gap-2 has-[:checked]:ring-desa-dark-green transition-setup"
          >
            <input
              type="radio"
              name="gender"
              id="gender-female"
              class="flex size-[18px] shrink-0 accent-desa-secondary checked:accent-desa-dark-green transition-setup"
              v-model="familyMember.gender"
              value="female"
            />
            <span
              class="font-medium leading-5 text-desa-secondary w-full group-has-[:checked]:text-desa-dark-green transition-setup"
            >
              Wanita
            </span>
            <div class="flex size-6 shrink-0">
              <img
                src="@/assets/images/icons/woman-secondary-green.svg"
                class="size-6 flex group-has-[:checked]:hidden"
                alt="icon"
              />
              <img
                src="@/assets/images/icons/woman-dark-green.svg"
                class="size-6 hidden group-has-[:checked]:flex"
                alt="icon"
              />
            </div>
          </label>
          <!-- radio button female end -->
        </div>
      </section>
      <!-- section form jenis kelamin end -->

      <!-- section form status start -->
      <hr class="border-desa-background" />
      <section id="Status" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">Status</p>
        <div class="flex flex-1 gap-6 shrink-0">
          <!-- radio button single start -->
          <label
            class="group flex w-full items-center h-14 rounded-2xl p-4 ring-[1.5px] ring-desa-background gap-2 has-[:checked]:ring-desa-dark-green transition-setup"
          >
            <input
              type="radio"
              name="status"
              id="status-single"
              class="flex size-[18px] shrink-0 accent-desa-secondary checked:accent-desa-dark-green transition-setup"
              v-model="familyMember.marital_status"
              value="single"
            />
            <span
              class="font-medium leading-5 text-desa-secondary w-full group-has-[:checked]:text-desa-dark-green transition-setup"
            >
              Belum Menikah
            </span>
            <div class="flex size-6 shrink-0">
              <img
                src="@/assets/images/icons/profile-secondary-green.svg"
                class="size-6 flex group-has-[:checked]:hidden"
                alt="icon"
              />
              <img
                src="@/assets/images/icons/profile-dark-green.svg"
                class="size-6 hidden group-has-[:checked]:flex"
                alt="icon"
              />
            </div>
          </label>
          <!-- radio button single end -->

          <!-- radio button married start -->
          <label
            class="group flex w-full items-center h-14 rounded-2xl p-4 ring-[1.5px] ring-desa-background gap-2 has-[:checked]:ring-desa-dark-green transition-setup"
          >
            <input
              type="radio"
              name="status"
              id="status-married"
              class="flex size-[18px] shrink-0 accent-desa-secondary checked:accent-desa-dark-green transition-setup"
              v-model="familyMember.marital_status"
              value="married"
            />
            <span
              class="font-medium leading-5 text-desa-secondary w-full group-has-[:checked]:text-desa-dark-green transition-setup"
            >
              Sudah Menikah
            </span>
            <div class="flex size-6 shrink-0">
              <img
                src="@/assets/images/icons/profile-2user-secondary-green.svg"
                class="size-6 flex group-has-[:checked]:hidden"
                alt="icon"
              />
              <img
                src="@/assets/images/icons/profile-2user-dark-green.svg"
                class="size-6 hidden group-has-[:checked]:flex"
                alt="icon"
              />
            </div>
          </label>
          <!-- radio button married end -->
        </div>
      </section>
      <!-- section form status end -->
      <hr class="border-desa-background w-[calc(100%+48px)] -mx-6" />

      <section id="Kategori-Keluarga" class="flex items-center">
        <h2 class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Kategori Keluarga
        </h2>
        <div class="flex-1 grid grid-cols-3 gap-6">
          <label
            class="relative flex items-center gap-2 rounded-2xl border border-desa-background p-4 hover:border-transparent hover:bg-desa-foreshadow has-[:checked]:bg-desa-foreshadow hover:ring-[1.5px] hover:ring-desa-dark-green has-[:checked]:ring-[1.5px] has-[:checked]:ring-desa-dark-green transition-all duration-300"
          >
            <input
              required
              v-model="familyMember.relation"
              value="wife"
              type="radio"
              name="kategori-keluarga"
              id="Istri"
              class="peer flex size-[18px] shrink-0 accent-desa-dark-green"
            />
            <p
              class="w-full font-medium text-desa-secondary leading-5 peer-checked:text-desa-dark-green"
            >
              Istri
            </p>
          </label>
          <label
            class="relative flex items-center gap-2 rounded-2xl border border-desa-background p-4 hover:border-transparent hover:bg-desa-foreshadow has-[:checked]:bg-desa-foreshadow hover:ring-[1.5px] hover:ring-desa-dark-green has-[:checked]:ring-[1.5px] has-[:checked]:ring-desa-dark-green transition-all duration-300"
          >
            <input
              required
              type="radio"
              v-model="familyMember.relation"
              value="child"
              name="kategori-keluarga"
              id="Anak"
              class="peer flex size-[18px] shrink-0 accent-desa-dark-green"
            />
            <p
              class="w-full font-medium text-desa-secondary leading-5 peer-checked:text-desa-dark-green"
            >
              Anak
            </p>
          </label>
          <label
            class="relative flex items-center gap-2 rounded-2xl border border-desa-background p-4 hover:border-transparent hover:bg-desa-foreshadow has-[:checked]:bg-desa-foreshadow hover:ring-[1.5px] hover:ring-desa-dark-green has-[:checked]:ring-[1.5px] has-[:checked]:ring-desa-dark-green transition-all duration-300"
          >
            <input
              required
              type="radio"
              v-model="familyMember.relation"
              value="husband"
              name="kategori-keluarga"
              id="Suami"
              class="peer flex size-[18px] shrink-0 accent-desa-dark-green"
            />
            <p
              class="w-full font-medium text-desa-secondary leading-5 peer-checked:text-desa-dark-green"
            >
              Suami
            </p>
          </label>
        </div>
      </section>
      <hr class="border-desa-background" />
      <!-- <p class="font-medium leading-5">Akun Dashboard</p> -->
      <section id="Email" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Email Address
        </p>
        <div class="flex flex-col gap-3 flex-1 shrink-0">
          <Input
            v-model="familyMember.email"
            type="email"
            placeholder="Ketik email Kamu"
            :error-message="error?.email"
            :icon="IconProfileSecondaryGreen"
            :filled-icon="IconProfileBlack"
          />
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Passwords" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">Passwords</p>
        <div class="flex flex-col gap-3 flex-1 shrink-0">
          <Input
            v-model="familyMember.password"
            type="password"
            placeholder="Ketik password Kamu"
            :error-message="error?.password"
            :icon="IconKeySecondaryGreen"
            :filled-icon="IconKeyBlack"
          />
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Buttons" class="flex items-center justify-end gap-4">
        <RouterLink :to="{ name: 'head-of-family' }">
          <div
            class="py-[18px] rounded-2xl bg-desa-red w-[180px] text-center flex justify-center font-medium text-white"
          >
            Batal, Tidak jadi
          </div>
        </RouterLink>
        <button
          :disabled="loading"
          id="submitButton"
          type="submit"
          class="py-[18px] rounded-2xl disabled:bg-desa-grey w-[180px] text-center flex justify-center font-medium text-white bg-desa-dark-green transition-all duration-300"
        >
          <span v-if="!loading"> Create Now! </span>
          <span v-else> Loading... </span>
        </button>
      </section>
    </div>
  </form>
</template>
