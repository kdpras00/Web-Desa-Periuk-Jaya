<script setup>
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showLoading, showLoginSuccess, showLoginError } from '@/helpers/sweetAlertHelper'
import IconProfileSecondaryGreen from '@/assets/images/icons/user-secondary-green.svg'
import IconProfileBlack from '@/assets/images/icons/user-black.svg'
import IconKeySecondaryGreen from '@/assets/images/icons/key-secondary-green.svg'
import IconKeyBlack from '@/assets/images/icons/key-black.svg'
import Button from '@/components/ui/Button.vue'
import { useAuthStore } from '@/stores/auth.js'
import Input from '@/components/ui/Input.vue'

const router = useRouter()
const authStore = useAuthStore()
const { loading, error } = storeToRefs(authStore)
const { login } = authStore

const form = ref({
  email: '',
  password: '',
})

const handleSubmit = async () => {
  // Show loading alert
  showLoading('Sedang Masuk...', 'Mohon tunggu sebentar')

  try {
    await login(form.value)

    // Check if login was successful
    if (!error.value) {
      // Show success alert
      await showLoginSuccess()
      
      // Navigate to dashboard
      router.push({ name: 'dashboard' })
    } else {
      // Show error alert
      const errorMessage = error.value === 'Unauthorized' 
        ? 'Email atau password salah' 
        : error.value?.message || 'Terjadi kesalahan saat login'
      
      await showLoginError(errorMessage)
      
      // Clear password on error
      form.value.password = ''
    }
  } catch (err) {
    // Show error alert for unexpected errors
    await showLoginError('Terjadi kesalahan yang tidak terduga')
    form.value.password = ''
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="flex items-center justify-center">
    <div class="flex flex-col h-fit w-[486px] shrink-0 rounded-3xl p-[32px] gap-[32px] bg-white">
      <header class="flex flex-col gap-[32px] items-center">
        <img
          src="@/assets/images/logos/logo-text.svg"
          alt="icon"
          class="shrink-0 h-[38px] w-[197px]"
        />
        <div class="flex flex-col gap-2">
          <h1 class="font-semibold text-[24px] leading-[30px] text-center">
            Halo🙌🏻 , Selamat Datang!
          </h1>
          <p class="font-medium leading-5 text-desa-secondary text-center">
            Silahkan masuk untuk melanjutkan
          </p>
        </div>
      </header>
      <section id="Select" class="grid grid-cols-2 gap-6">
        <div
          class="group relative flex items-center justify-between p-5 rounded-2xl bg-white ring-[1px] ring-desa-background hover:bg-desa-foreshadow has-[:checked]:bg-desa-foreshadow has-[:checked]:ring-desa-dark-green transition-all duration-300"
        >
          <input
            id="Kepala-Desa"
            required
            type="radio"
            name="role"
            class="peer absolute left-0 right-0 top-0 bottom-0 z-50 opacity-0"
          />
          <p
            class="font-medium leading-5 text-desa-secondary group-hover:text-desa-dark-green group-has-[:checked]:text-desa-dark-green transition-all duration-300"
          >
            Lurah
          </p>
          <div class="relative">
            <img
              src="@/assets/images/icons/crown-secondary-green.svg"
              alt="icon"
              class="shrink-0 h-[24px] w-[24px] group-hover:opacity-0 group-has-[:checked]:opacity-0 absolute transition-all duration-300"
            />
            <img
              src="@/assets/images/icons/crown-dark-green.svg"
              alt="icon"
              class="shrink-0 h-[24px] w-[24px] group-hover:opacity-100 group-has-[:checked]:opacity-100 opacity-0 transition-all duration-300"
            />
          </div>
        </div>
        <div
          class="group relative flex items-center justify-between p-5 rounded-2xl bg-white ring-[1px] ring-desa-background hover:bg-desa-foreshadow has-[:checked]:bg-desa-foreshadow has-[:checked]:ring-desa-dark-green transition-all duration-300"
        >
          <input
            id="Kepala-Rumah"
            required
            type="radio"
            name="role"
            class="peer absolute left-0 right-0 top-0 bottom-0 z-50 opacity-0"
          />
          <p
            class="font-medium leading-5 text-desa-secondary group-hover:text-desa-dark-green group-has-[:checked]:text-desa-dark-green transition-all duration-300"
          >
            Kepala Rumah
          </p>
          <div class="relative">
            <img
              src="@/assets/images/icons/profile-circle-secondary-green.svg"
              alt="icon"
              class="shrink-0 h-[24px] w-[24px] group-hover:opacity-0 group-has-[:checked]:opacity-0 absolute transition-all duration-300"
            />
            <img
              src="@/assets/images/icons/profile-circle-dark-green.svg"
              alt="icon"
              class="shrink-0 h-[24px] w-[24px] group-hover:opacity-100 group-has-[:checked]:opacity-100 opacity-0 transition-all duration-300"
            />
          </div>
        </div>
      </section>
      <section id="Inputs" class="flex flex-col gap-[32px]">
        <div id="Email-Address" class="flex flex-col gap-4">
          <h2 class="font-medium leading-5 text-desa-secondary">Email Address</h2>
          <Input
            v-model="form.email"
            type="email"
            placeholder="Ketik email Kamu"
            :error-message="error?.email"
            :icon="IconProfileSecondaryGreen"
            :filled-icon="IconProfileBlack"
          />
        </div>
        <div id="Password" class="flex flex-col gap-4">
          <h2 class="font-medium leading-5 text-desa-secondary">Password</h2>
          <Input
            v-model="form.password"
            type="password"
            placeholder="Ketik password Kamu"
            :error-message="error?.password"
            :icon="IconKeySecondaryGreen"
            :filled-icon="IconKeyBlack"
          />
        </div>
      </section>
      <Button type="submit" label="Masuk" :loading="loading" />
    </div>
  </form>
</template>
