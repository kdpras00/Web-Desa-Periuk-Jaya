<script setup>
import { useSocialAssistanceStore } from "@/stores/socialAssistance";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import IconEditSecondaryGreen from "@/assets/images/icons/edit-secondary-green.svg";
import IconEditBlack from "@/assets/images/icons/edit-black.svg";
import IconDollarSquareSecondaryGreen from "@/assets/images/icons/dollar-square-secondary-green.svg";
import IconDollarSquareBlack from "@/assets/images/icons/dollar-square-black.svg";
import IconProfileSecondaryGreen from "@/assets/images/icons/user-secondary-green.svg";
import IconProfileBlack from "@/assets/images/icons/user-black.svg";

import Input from "@/components/ui/Input.vue";
import { formatRupiah, parseRupiah } from "@/helpers/format";

const route = useRoute();

const socialAssistance = ref({
  id: null,
  thumbnail: null,
  thumbnail_url: null,
  name: null,
  category: null,
  amount: 0,
  provider: null,
  description: null,
  is_available: true,
});

const socialAssistanceStore = useSocialAssistanceStore();
const { loading, error } = storeToRefs(socialAssistanceStore);
const { fetchSocialAssistance, updateSocialAssistance } = socialAssistanceStore;
const fetchData = async () => {
  const response = await fetchSocialAssistance(route.params.id);

  socialAssistance.value = response;

  socialAssistance.value.thumbnail_url = response.thumbnail;
  socialAssistance.value.thumbnail = null;
};

const handleSubmit = async () => {
  await updateSocialAssistance({
    ...socialAssistance.value,
    amount: parseRupiah(socialAssistance.value.amount),
  });
};

const handleImageChange = (event) => {
  const file = event.target.files[0];
  socialAssistance.value.thumbnail = file;
  socialAssistance.value.thumbnail_url = URL.createObjectURL(file);
};

watch(
  () => socialAssistance.value.amount,
  (newAmount) => {
    socialAssistance.value.amount = formatRupiah(newAmount);
  }
);
onMounted(fetchData);
</script>

<template>
  <div id="Header" class="flex items-center justify-between">
    <div class="flex flex-col gap-2">
      <div class="flex gap-1 items-center leading-5 text-desa-secondary">
        <p
          class="last-of-type:text-desa-dark-green last-of-type:font-semibold capitalize"
        >
          Bantuan sosial
        </p>
        <span>/</span>
        <p
          class="last-of-type:text-desa-dark-green last-of-type:font-semibold capitalize"
        >
          tambah bantuan sosial
        </p>
      </div>
      <h1 class="font-semibold text-2xl">Tambah Bantuan Sosial</h1>
    </div>
  </div>
  <form @submit.prevent="handleSubmit" id="myForm" class="capitalize">
    <div class="shrink-0 rounded-3xl p-6 bg-white flex flex-col gap-6 h-fit">
      <section id="Thumbnail" class="flex items-center justify-between">
        <h2 class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Thumbnail Bantuan Sosial
        </h2>
        <div class="flex-1 flex items-center justify-between">
          <div
            id="Photo-Preview"
            class="flex itce justify-center w-[120px] h-[100px] rounded-2xl overflow-hidden bg-desa-foreshadow"
          >
            <img
              id="Photo"
              :src="socialAssistance.thumbnail_url"
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
      <section id="Nama-Bantuan-Sosial" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Nama Bantuan Sosial
        </p>
        <div class="flex flex-col gap-3 flex-1 shrink-0">
          <Input
            v-model="socialAssistance.name"
            type="text"
            placeholder="Ketik Nama Kamu"
            :error-message="error?.name"
            :icon="IconEditSecondaryGreen"
            :filled-icon="IconEditBlack"
          />
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Kategori" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Pilih Opsi Kategori
        </p>
        <div class="grid grid-cols-2 flex-1 gap-6 shrink-0">
          <label
            class="group flex w-full items-center h-14 rounded-2xl p-4 ring-[1.5px] ring-desa-background gap-2 has-[:checked]:ring-none has-[:checked]:bg-desa-foreshadow transition-setup"
          >
            <input
              value="staple"
              v-model="socialAssistance.category"
              type="radio"
              name="category"
              id=""
              class="flex size-[18px] shrink-0 accent-desa-secondary checked:accent-desa-dark-green transition-setup"
            />
            <span
              class="font-medium leading-5 text-desa-secondary w-full group-has-[:checked]:text-desa-dark-green transition-setup"
            >
              Bahan Pokok
            </span>
            <div class="flex size-6 shrink-0">
              <img
                src="@/assets/images/icons/bag-2-secondary-green.svg"
                class="size-6 flex group-has-[:checked]:hidden"
                alt="icon"
              />
              <img
                src="@/assets/images/icons/bag-2-dark-green.svg"
                class="size-6 hidden group-has-[:checked]:flex"
                alt="icon"
              />
            </div>
          </label>
          <label
            class="group flex w-full items-center h-14 rounded-2xl p-4 ring-[1.5px] ring-desa-background gap-2 has-[:checked]:ring-none has-[:checked]:bg-desa-foreshadow transition-setup"
          >
            <input
              value="cash"
              v-model="socialAssistance.category"
              type="radio"
              name="category"
              id=""
              class="flex size-[18px] shrink-0 accent-desa-secondary checked:accent-desa-dark-green transition-setup"
            />
            <span
              class="font-medium leading-5 text-desa-secondary w-full group-has-[:checked]:text-desa-dark-green transition-setup"
            >
              Uang Tunai
            </span>
            <div class="flex size-6 shrink-0">
              <img
                src="@/assets/images/icons/money-secondary-green.svg"
                class="size-6 flex group-has-[:checked]:hidden"
                alt="icon"
              />
              <img
                src="@/assets/images/icons/money-dark-green.svg"
                class="size-6 hidden group-has-[:checked]:flex"
                alt="icon"
              />
            </div>
          </label>
          <label
            class="group flex w-full items-center h-14 rounded-2xl p-4 ring-[1.5px] ring-desa-background gap-2 has-[:checked]:ring-none has-[:checked]:bg-desa-foreshadow transition-setup"
          >
            <input
              value="subsidized fuel"
              v-model="socialAssistance.category"
              type="radio"
              name="category"
              id=""
              class="flex size-[18px] shrink-0 accent-desa-secondary checked:accent-desa-dark-green transition-setup"
            />
            <span
              class="font-medium leading-5 text-desa-secondary w-full group-has-[:checked]:text-desa-dark-green transition-setup"
            >
              Keperluan Bahan Bakar
            </span>
            <div class="flex size-6 shrink-0">
              <img
                src="@/assets/images/icons/money-secondary-green.svg"
                class="size-6 flex group-has-[:checked]:hidden"
                alt="icon"
              />
              <img
                src="@/assets/images/icons/money-dark-green.svg"
                class="size-6 hidden group-has-[:checked]:flex"
                alt="icon"
              />
            </div>
          </label>
          <label
            class="group flex w-full items-center h-14 rounded-2xl p-4 ring-[1.5px] ring-desa-background gap-2 has-[:checked]:ring-none has-[:checked]:bg-desa-foreshadow transition-setup"
          >
            <input
              value="health"
              v-model="socialAssistance.category"
              type="radio"
              name="category"
              id=""
              class="flex size-[18px] shrink-0 accent-desa-secondary checked:accent-desa-dark-green transition-setup"
            />
            <span
              class="font-medium leading-5 text-desa-secondary w-full group-has-[:checked]:text-desa-dark-green transition-setup"
            >
              Kesehatan
            </span>
            <div class="flex size-6 shrink-0">
              <img
                src="@/assets/images/icons/health-secondary-green.svg"
                class="size-6 flex group-has-[:checked]:hidden"
                alt="icon"
              />
              <img
                src="@/assets/images/icons/health-secondary-green.svg"
                class="size-6 hidden group-has-[:checked]:flex"
                alt="icon"
              />
            </div>
          </label>
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Nominal Bantuan" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Nominal Bantuan
        </p>
        <div class="flex flex-col gap-3 flex-1 shrink-0">
          <Input
            v-model="socialAssistance.amount"
            type="text"
            placeholder="Ketik Nominal Bantuan"
            :error-message="error?.amount"
            :icon="IconDollarSquareSecondaryGreen"
            :filled-icon="IconDollarSquareBlack"
          />
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Nama-Pemberi-Bantuan" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Nama Pemberi Bantuan
        </p>
        <div class="flex flex-col gap-3 flex-1 shrink-0">
          <Input
            v-model="socialAssistance.provider"
            type="text"
            placeholder="Ketik Nominal Bantuan"
            :error-message="error?.provider"
            :icon="IconProfileSecondaryGreen"
            :filled-icon="IconProfileBlack"
          />
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Deskripsi" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Deskripsi Bantuan Sosial
        </p>
        <div class="flex flex-col gap-3 flex-1 shrink-0">
          <textarea
            v-model="socialAssistance.description"
            name=""
            id=""
            placeholder="Jelaskan lebih detail tentang bantuan"
            rows="6"
            class="appearance-none outline-none w-full rounded-2xl ring-[1.5px] ring-desa-background focus:ring-desa-black py-4 px-4 gap-2 font-medium placeholder:text-desa-secondary transition-all duration-300"
          >
Program Bantuan Sosial ini merupakan bentuk kepedulian [nama penyelenggara] terhadap masyarakat yang terdampak oleh kondisi sosial, ekonomi, maupun bencana tertentu. Program ini bertujuan untuk meringankan beban masyarakat dalam memenuhi kebutuhan dasar, serta mendukung peningkatan kesejahteraan dan taraf hidup.
                                    </textarea
          >
        </div>
      </section>
      <hr class="border-desa-background" />
      <section id="Ketersediaan" class="flex items-center justify-between">
        <p class="font-medium leading-5 text-desa-secondary w-[calc(424/904*100%)]">
          Pilih Opsi Ketersediaan
        </p>
        <div class="flex flex-1 gap-6 shrink-0">
          <label
            class="group flex w-full items-center h-14 rounded-2xl p-4 ring-[1.5px] ring-desa-background gap-2 has-[:checked]:ring-none has-[:checked]:bg-desa-foreshadow transition-setup"
          >
            <input
              v-model="socialAssistance.is_available"
              value="1"
              type="radio"
              name="gender"
              id=""
              class="flex size-[18px] shrink-0 accent-desa-secondary checked:accent-desa-dark-green transition-setup"
            />
            <span
              class="font-medium leading-5 text-desa-secondary w-full group-has-[:checked]:text-desa-dark-green transition-setup"
            >
              Tersedia
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
              v-model="socialAssistance.is_available"
              value="0"
              type="radio"
              name="gender"
              id=""
              class="flex size-[18px] shrink-0 accent-desa-secondary checked:accent-desa-dark-green transition-setup"
            />
            <span
              class="font-medium leading-5 text-desa-secondary w-full group-has-[:checked]:text-desa-dark-green transition-setup"
            >
              Tidak Tersedia
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
      <hr class="border-desa-background w-[calc(100%+48px)] -mx-6" />
      <section id="Buttons" class="flex items-center justify-end gap-4">
        <RouterLink
          :to="{ name: 'manage-social-assistance', params: { id: socialAssistance.id } }"
        >
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
          <span v-if="!loading"> Update Now! </span>
          <span v-else> Loading... </span>
        </button>
      </section>
    </div>
  </form>
</template>
