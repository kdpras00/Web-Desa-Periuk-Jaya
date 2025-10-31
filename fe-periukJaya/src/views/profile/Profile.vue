<script setup>
import { can } from "@/helpers/permissionHelper";
import { useProfileStore } from "@/stores/profile";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";
import { getAddressFromCoordinates } from "@/helpers/geocoding";
import Swal from 'sweetalert2';

const profileStore = useProfileStore();
const { profile, success } = storeToRefs(profileStore);
const { fetchProfile, deleteProfile } = profileStore;

const showModalImage = ref(false);
const address = ref('Memuat alamat...');

const handleDelete = () => {
  Swal.fire({
    title: 'Hapus Profile Desa?',
    text: "Data profile desa akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      deleteProfile();
    }
  });
};

const selectImage = (index) => {
  showModalImage.value = true;

  setTimeout(() => {
    const selectedImage = document.getElementById("Selected-Image");
    selectedImage.src = profile.value.profile_images[index].image;
  }, 100);
};

// Watch for profile changes and fetch address from coordinates
watch(profile, async (newProfile) => {
  // Use profile coordinates if available, otherwise use default Periuk Jaya coordinates
  const lat = newProfile?.latitude || -6.172426;
  const lng = newProfile?.longitude || 106.5891558;
  address.value = await getAddressFromCoordinates(lat, lng);
}, { immediate: true });

onMounted(fetchProfile);
</script>

<template>
  <div v-if="!profile">
    <div id="Header" class="flex items-center justify-between">
      <div class="flex flex-col gap-2">
        <h1 class="font-semibold text-2xl">Profile Desa</h1>
      </div>
      <RouterLink
        :to="{ name: 'create-profile' }"
        class="flex items-center rounded-2xl py-4 px-6 gap-[10px] bg-desa-dark-green"
        v-if="can('profile-create')"
      >
        <p class="font-medium text-white">Create Profile</p>
        <img
          src="@/assets/images/icons/add-square-white.svg"
          class="flex size-6 shrink-0"
          alt="icon"
        />
      </RouterLink>
    </div>
    <div
      id="Empty-Profile"
      class="flex flex-col flex-1 items-center justify-center gap-6"
    >
      <img
        src="@/assets/images/icons/user-remove-secondary-green.svg"
        class="size-20 object-cover"
        alt="icon"
      />
      <p class="font-semibold text-lg text-desa-secondary">
        Ops, Saat ini kamu belum membuat profile desa
      </p>
    </div>
  </div>

  <div v-else>
    <div id="Header" class="flex items-center justify-between mb-6">
      <div class="flex flex-col gap-2">
        <h1 class="font-semibold text-2xl">Profile Desa</h1>
      </div>
      <div class="flex items-center gap-3">
        <RouterLink
          :to="{ name: 'edit-profile' }"
          class="flex items-center rounded-2xl py-4 px-6 gap-[10px] bg-desa-black"
          v-if="can('profile-edit')"
        >
          <p class="font-medium text-white">Ubah Data</p>
          <img
            src="@/assets/images/icons/edit-white.svg"
            class="flex size-6 shrink-0"
            alt="icon"
          />
        </RouterLink>
        <button
          @click="handleDelete"
          class="flex items-center rounded-2xl py-4 px-6 gap-[10px] bg-desa-red"
          v-if="can('profile-edit')"
        >
          <p class="font-medium text-white">Hapus Profile</p>
          <img
            src="@/assets/images/icons/trash-white.svg"
            class="flex size-6 shrink-0"
            alt="icon"
          />
        </button>
      </div>
    </div>
    <div class="flex gap-[14px]">
      <section
        id="Nama-Desa"
        class="flex flex-col shrink-0 w-[calc(565/1000*100%)] h-fit rounded-3xl p-6 gap-6 bg-white"
      >
        <div class="flex items-center justify-between">
          <p class="font-medium leading-5 text-desa-secondary">Nama Desa</p>
          <img
            src="@/assets/images/icons/building-foreshadow-background.svg"
            class="flex size-12 shrink-0"
            alt="icon"
          />
        </div>
        <div id="Nama-Desa" class="flex flex-col gap-[6px]">
          <h1 class="font-bold text-[32px] leading-10">{{ profile.name }}</h1>
          <div class="flex items-center gap-0.5">
            <img
              src="@/assets/images/icons/location-secondary-green.svg"
              class="flex size-6 shrink-0"
              alt="icon"
            />
            <span class="font-medium text-sm text-desa-secondary">{{ address }}</span>
          </div>
        </div>
        <div id="Gallery" class="flex flex-col gap-[14px]">
          <div
            data-modal="Modal-Gallery"
            data-gallery="@/assets/images/thumbnails/desa-gallery-1.png"
            id="Thumbnail-Desa"
            class="flex w-[492px] h-[300px] shrink-0 rounded-3xl bg-desa-background overflow-hidden"
          >
            <img
              :src="profile.thumbnail"
              class="w-full h-full object-cover"
              alt="thumbnail"
            />
          </div>
          <div class="grid grid-cols-3 gap-[14px] w-[492px]">
            <div
              v-for="(image, index) in profile.profile_images"
              :key="index"
              class="relative"
            >
              <button class="relative" @click="selectImage(index)">
                <div
                  class="thumbnail-selection flex w-full h-[120px] shrink-0 rounded-3xl bg-desa-background overflow-hidden"
                >
                  <img
                    :src="image.image"
                    class="w-full h-full object-cover"
                    alt="thumbnail"
                  />
                </div>
                <div
                  v-if="index === 2"
                  class="absolute inset-0 rounded-3xl overflow-hidden flex flex-col items-center justify-center bg-[#001B1ACC] text-white"
                >
                  <p class="font-semibold text-xl leading-6">2+</p>
                  <p class="font-semibold text-sm text-white">Photo</p>
                </div>
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <p class="font-medium text-sm text-desa-secondary">Tentang Desa</p>
          <p class="font-medium leading-8">
            {{ profile.about }}
          </p>
        </div>
        <div class="flex flex-col gap-3">
          <p class="font-medium text-sm text-desa-secondary">Peta Desa</p>
          <div class="rounded-2xl overflow-hidden max-w-full w-full !h-[350px]">
            <div id="embedded-map-display" class="size-full max-w-full">
              <iframe
                :src="`https://www.google.com/maps?q=${profile.latitude || -6.172426},${profile.longitude || 106.5891558}&output=embed`"
                width="600"
                height="450"
                style="border: 0"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
      <section
        id="Detail-Desa"
        class="flex flex-col flex-1 h-fit shrink-0 rounded-3xl p-6 gap-6 bg-white"
      >
        <p class="font-medium leading-5 text-desa-secondary">Detail Desa</p>
        <div class="flex flex-col gap-[14px]">
          <div class="flex items-center gap-3 w-[302px] shrink-0">
            <div class="flex size-[54px] rounded-full bg-desa-foreshadow overflow-hidden">
              <img
                src="@/assets/images/photos/kk-photo-1.png"
                class="w-full h-full object-cover"
                alt="icon"
              />
            </div>
            <div class="flex flex-col gap-1">
              <p class="font-semibold text-lg leading-5 text-desa-black">
                {{ profile.headman }}
              </p>
              <p class="flex items-center gap-1">
                <span class="font-medium text-sm text-desa-secondary">Lurah</span>
              </p>
            </div>
          </div>
          <hr class="border-desa-background" />
          <div class="flex items-center gap-3 w-[302px] shrink-0">
            <div
              class="flex size-[52px] rounded-2xl items-center justify-center bg-desa-foreshadow overflow-hidden"
            >
              <img
                src="@/assets/images/icons/profile-2user-dark-green.svg"
                class="flex size-6 shrink-0"
                alt="icon"
              />
            </div>
            <div class="flex flex-col gap-1">
              <p class="font-semibold text-lg leading-5">{{ profile.people }}</p>
              <p class="font-medium text-sm text-desa-secondary">Jumlah Penduduk</p>
            </div>
          </div>
          <hr class="border-desa-background" />
          <div class="flex items-center gap-3 w-[302px] shrink-0">
            <div
              class="flex size-[52px] rounded-2xl items-center justify-center bg-desa-foreshadow overflow-hidden"
            >
              <img
                src="@/assets/images/icons/tree-dark-green.svg"
                class="flex size-6 shrink-0"
                alt="icon"
              />
            </div>
            <div class="flex flex-col gap-1">
              <p class="font-semibold text-lg leading-5">41</p>
              <p class="font-medium text-sm text-desa-secondary">Jumlah RT</p>
            </div>
          </div>
          <div class="flex items-center gap-3 w-[302px] shrink-0">
            <div
              class="flex size-[52px] rounded-2xl items-center justify-center bg-desa-foreshadow overflow-hidden"
            >
              <img
                src="@/assets/images/icons/tree-dark-green.svg"
                class="flex size-6 shrink-0"
                alt="icon"
              />
            </div>
            <div class="flex flex-col gap-1">
              <p class="font-semibold text-lg leading-5">8</p>
              <p class="font-medium text-sm text-desa-secondary">Jumlah RW</p>
            </div>
          </div>
          <hr class="border-desa-background" />
          <div class="flex items-center gap-3 w-[302px] shrink-0">
            <div
              class="flex size-[52px] rounded-2xl items-center justify-center bg-desa-foreshadow overflow-hidden"
            >
              <img
                src="@/assets/images/icons/grid-5-dark-green.svg"
                class="flex size-6 shrink-0"
                alt="icon"
              />
            </div>
            <div class="flex flex-col gap-1">
              <p class="font-semibold text-lg leading-5">
                {{ profile.total_area }}<sup>2</sup>
              </p>
              <p class="font-medium text-sm text-desa-secondary">Luas Area</p>
            </div>
          </div>
          <hr class="border-desa-background" />
          <div class="flex items-center gap-3 w-[302px] shrink-0">
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
              <p class="font-semibold text-lg leading-5">Mon, 24 Feb 2012</p>
              <p class="font-medium text-sm text-desa-secondary">Desa Dibangun</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div
      id="Modal-Gallery"
      class="modal fixed inset-0 flex flex-col h-screen z-40 bg-[#080C1ACC]"
      v-if="showModalImage"
    >
      <div class="flex-col items-center justify-center m-auto">
        <div
          id="Main-Image-Container"
          class="flex aspect-[805/492] w-full max-w-[805px] overflow-hidden mx-auto"
        >
          <img
            id="Selected-Image"
            :src="profile.thumbnail"
            class="size-full object-contain object-center"
            alt="thumbnail"
          />
        </div>

        <button
          class="btn-close-modal flex items-center rounded-full border border-white/10 py-3 px-4 mx-auto mt-[30px]"
          @click="showModalImage = false"
        >
          <img
            src="@/assets/images/icons/close-circle-white.svg"
            class="flex size-6 shrink-0"
            alt="icon"
          />
          <p class="font-medium leading-5 text-white">Tutup</p>
        </button>
      </div>

      <div class="flex flex-wrap items-center w-full border border-white/10 gap-4 p-4">
        <button
          v-for="(image, index) in profile.profile_images"
          :key="index"
          @click="selectImage(index)"
          class="group relative flex w-[140px] h-[120px] shrink-0 rounded-3xl bg-desa-background overflow-hidden active"
        >
          <img
            :src="image.image"
            class="size-full object-cover group-[:active]:blur"
            alt="thumbnail"
          />
          <img
            src="@/assets/images/icons/eye-white-fill.svg"
            class="absolute hidden size-9 shrink-0 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 group-[:active]:flex"
            alt="icon"
          />
        </button>
      </div>
    </div>
  </div>
</template>
