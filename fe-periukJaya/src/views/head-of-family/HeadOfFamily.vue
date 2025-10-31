<script setup>
import ModalDelete from "@/components/ui/ModalDelete.vue";
import { ucfirst, formatRupiah, formatToClientTimeZone } from "@/helpers/format";
import { useDeleteConfirmation } from "@/composables/useFormHelpers";
import router from "@/router";
import { useHeadOfFamilyStore } from "@/stores/headOfFamily";
import { storeToRefs } from "pinia";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const { confirmDelete, showSuccess, showError } = useDeleteConfirmation();

const headOfFamily = ref({});
const headOfFamilyStore = useHeadOfFamilyStore();
const { loading } = storeToRefs(headOfFamilyStore);
const { fetchHeadOfFamily, deleteHeadOfFamily } = headOfFamilyStore;
const fetchData = async () => {
  const response = await fetchHeadOfFamily(route.params.id);

  headOfFamily.value = response;
};
const showModalDelete = ref(false);

async function handleDelete() {
  const confirmed = await confirmDelete({
    title: 'Hapus Kepala Keluarga?',
    text: 'Data kepala keluarga akan dihapus secara permanen.',
  });
  
  if (!confirmed) return;
  
  try {
    await deleteHeadOfFamily(route.params.id);
    await showSuccess('Kepala keluarga berhasil dihapus');
    router.push({ name: "head-of-family" });
  } catch (error) {
    await showError(error.message || 'Gagal menghapus kepala keluarga');
  }
}

const calculateAge = (dateString) => {
  if (!dateString) return 0;
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Tab Switching
const activeTab = ref('Bansos');

const setActiveTab = (tabName) => {
  activeTab.value = tabName;
};

// Get job applicants through user
const jobApplicants = computed(() => {
  return headOfFamily.value?.user?.job_applicants || [];
});

onMounted(fetchData);
</script>

<template>
  <div id="Header" class="flex items-center justify-between">
    <div class="flex flex-col gap-2">
      <div class="flex gap-1 items-center leading-5 text-desa-secondary">
        <p
          class="last-of-type:text-desa-dark-green last-of-type:font-semibold capitalize"
        >
          Kepala Rumah
        </p>
        <span>/</span>
        <p
          class="last-of-type:text-desa-dark-green last-of-type:font-semibold capitalize"
        >
          Manage Kepala Rumah
        </p>
      </div>
      <h1 class="font-semibold text-2xl">Manage Kepala Rumah</h1>
    </div>
    <button
      data-modal="Modal-Delete"
      class="flex items-center rounded-2xl py-4 px-6 gap-[10px] bg-desa-red"
      @click="showModalDelete = true"
    >
      <p class="font-medium text-white">Hapus Data</p>
      <img
        src="@/assets/images/icons/trash-white.svg"
        class="flex size-6 shrink-0"
        alt="icon"
      />
    </button>
  </div>
  <div class="flex gap-[14px]">
    <div class="flex flex-col w-[calc(525/1000*100%)] shrink-0 gap-[14px]">
      <section id="Kepala-Rumah" class="flex flex-col rounded-3xl p-6 gap-6 bg-white">
        <p class="font-medium leading-5 text-desa-secondary">Kepala Rumah</p>
        <div class="flex items-center gap-4">
          <div
            class="flex size-[76px] shrink-0 rounded-full overflow-hidden bg-desa-foreshadow"
          >
            <img
              :src="headOfFamily?.profile_picture"
              class="w-full h-full object-cover"
              alt="photo"
            />
          </div>
          <div class="flex flex-col gap-[6px] w-full">
            <p class="font-semibold text-xl line-clamp-1">
              {{ headOfFamily.user?.name }}
            </p>
            <p class="flex items-center gap-1">
              <img
                src="@/assets/images/icons/briefcase-secondary-green.svg"
                class="flex size-[18px] shrink-0"
                alt="icon"
              />
              <span class="font-medium text-sm text-desa-secondary">{{
                headOfFamily.occupation
              }}</span>
            </p>
          </div>
          <div
            class="badge rounded-full p-3 gap-2 flex w-[100px] justify-center shrink-0 bg-desa-soft-green"
          >
            <span class="font-semibold text-xs text-white uppercase">{{
              headOfFamily.marital_status
            }}</span>
          </div>
        </div>
        <hr class="border-desa-foreshadow" />
        <div class="flex items-center w-full gap-3">
          <div
            class="flex size-[52px] shrink-0 rounded-2xl bg-desa-foreshadow items-center justify-center"
          >
            <img
              src="@/assets/images/icons/keyboard-dark-green.svg"
              class="flex size-6 shrink-0"
              alt="icon"
            />
          </div>
          <div class="flex flex-col gap-1 w-full">
            <p class="font-semibold text-xl leading-[22.5px]">
              {{ headOfFamily.identity_number }}
            </p>
            <span class="font-medium text-desa-secondary">
              Nomor Induk Kependudukan
            </span>
          </div>
        </div>
        <hr class="border-desa-foreshadow" />
        <div class="flex items-center w-full gap-3">
          <div
            class="flex size-[52px] shrink-0 rounded-2xl bg-desa-foreshadow items-center justify-center"
          >
            <img
              src="@/assets/images/icons/user-square-dark-green.svg"
              class="flex size-6 shrink-0"
              alt="icon"
            />
          </div>
          <div class="flex flex-col gap-1 w-full">
            <p class="font-semibold text-xl leading-[22.5px]">
              {{ calculateAge(headOfFamily.date_of_birth) }} Tahun
            </p>
            <span class="font-medium text-desa-secondary"> Umur Kepala Rumah </span>
          </div>
        </div>
        <hr class="border-desa-foreshadow" />
        <div class="flex items-center w-full gap-3">
          <div
            class="flex size-[52px] shrink-0 rounded-2xl bg-desa-foreshadow items-center justify-center"
          >
            <img
              src="@/assets/images/icons/man-dark-green.svg"
              class="flex size-6 shrink-0"
              alt="icon"
            />
          </div>
          <div class="flex flex-col gap-1 w-full">
            <p class="font-semibold text-xl leading-[22.5px]">
              {{ ucfirst(headOfFamily.gender) }}
            </p>
            <span class="font-medium text-desa-secondary"> Jenis Kelamin </span>
          </div>
        </div>
        <hr class="border-desa-foreshadow" />
        <div class="flex items-center w-full gap-3">
          <div
            class="flex size-[52px] shrink-0 rounded-2xl bg-desa-foreshadow items-center justify-center"
          >
            <img
              src="@/assets/images/icons/sms-dark-green.svg"
              class="flex size-6 shrink-0"
              alt="icon"
            />
          </div>
          <div class="flex flex-col gap-1 w-full">
            <p class="font-semibold text-xl leading-[22.5px]">
              {{ headOfFamily.user?.email }}
            </p>
            <span class="font-medium text-desa-secondary"> Email Address </span>
          </div>
        </div>
        <hr class="border-desa-foreshadow" />
        <div class="flex items-center w-full gap-3">
          <div
            class="flex size-[52px] shrink-0 rounded-2xl bg-desa-foreshadow items-center justify-center"
          >
            <img
              src="@/assets/images/icons/call-dark-green.svg"
              class="flex size-6 shrink-0"
              alt="icon"
            />
          </div>
          <div class="flex flex-col gap-1 w-full">
            <p class="font-semibold text-xl leading-[22.5px]">
              {{ headOfFamily.phone_number }}
            </p>
            <span class="font-medium text-desa-secondary"> Nomor Hp </span>
          </div>
        </div>
      </section>
      <section
        id="Anggota-Keluarga"
        class="flex flex-col rounded-3xl p-6 gap-6 bg-white"
        v-if="headOfFamily.family_members?.length"
      >
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-[6px]">
            <p class="font-semibold text-[32px] leading-10">
              {{ headOfFamily.family_members?.length }}
            </p>
            <p class="font-medium leading-5 text-desa-secondary">Anggota Keluarga</p>
          </div>
          <img
            src="@/assets/images/icons/profile-2user-foreshadow-background.svg"
            class="flex size-12 shrink-0"
            alt="icon"
          />
        </div>
        <hr class="border-desa-foreshadow" />
        <div class="flex flex-col gap-[14px]">
          <div
            class="card flex flex-col rounded-2xl border border-desa-background p-4 gap-6"
            v-for="familyMember in headOfFamily.family_members"
            :key="index"
          >
            <div class="flex items-center gap-4">
              <div
                class="flex size-[64px] shrink-0 rounded-full overflow-hidden bg-desa-foreshadow"
              >
                <img
                  :src="familyMember.profile_picture"
                  class="w-full h-full object-cover"
                  alt="photo"
                />
              </div>
              <div class="flex flex-col gap-[6px] w-full">
                <p class="font-semibold text-xl line-clamp-1">
                  {{ familyMember.user?.name }}
                </p>
                <p class="flex items-center gap-1">
                  <img
                    src="@/assets/images/icons/briefcase-secondary-green.svg"
                    class="flex size-[18px] shrink-0"
                    alt="icon"
                  />
                  <span class="font-medium text-sm text-desa-secondary">{{
                    familyMember.occupation
                  }}</span>
                </p>
              </div>
              <p class="font-medium leading-5 text-nowrap">
                {{ calculateAge(familyMember.date_of_birth) }} tahun
              </p>
            </div>
            <hr class="border-desa-background" />
            <div class="flex justify-between items-center">
              <p class="flex items-center gap-1">
                <img
                  src="@/assets/images/icons/keyboard-secondary-green.svg"
                  class="flex size-[18px] shrink-0"
                  alt="icon"
                />
                <span class="font-medium text-sm text-desa-secondary"
                  >Nomor Induk Kependudukan:</span
                >
              </p>
              <p class="font-medium leading-5">{{ familyMember.identity_number }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
    <div class="flex flex-col flex-1 shrink-0 gap-[14px]">
      <section id="Recent-Activity" class="flex flex-col rounded-3xl p-6 gap-6 bg-white">
        <p class="font-medium leading-5 text-desa-secondary">Recent Activity</p>
        <div id="Tabs-Button" class="grid grid-cols-3 gap-3">
          <button 
            @click="setActiveTab('Bansos')" 
            class="tab-btn group"
            :class="{ 'active': activeTab === 'Bansos' }"
          >
            <div
              class="flex items-center justify-center rounded-full border border-desa-background py-[14px] px-[18px] group-hover:bg-desa-black group-[.active]:bg-desa-black transition-setup"
            >
              <span
                class="font-medium leading-5 text-desa-secondary group-hover:text-white group-[.active]:text-white transition-setup"
              >
                Bansos ({{ headOfFamily.social_assistance_recipients?.length || 0 }})
              </span>
            </div>
          </button>
          <button 
            @click="setActiveTab('Events')" 
            class="tab-btn group"
            :class="{ 'active': activeTab === 'Events' }"
          >
            <div
              class="flex items-center justify-center rounded-full border border-desa-background py-[14px] px-[18px] group-hover:bg-desa-black group-[.active]:bg-desa-black transition-setup"
            >
              <span
                class="font-medium leading-5 text-desa-secondary group-hover:text-white group-[.active]:text-white transition-setup"
              >
                Events ({{ headOfFamily.event_participants?.length || 0 }})
              </span>
            </div>
          </button>
          <button 
            @click="setActiveTab('Applicants')" 
            class="tab-btn group"
            :class="{ 'active': activeTab === 'Applicants' }"
          >
            <div
              class="flex items-center justify-center rounded-full border border-desa-background py-[14px] px-[18px] group-hover:bg-desa-black group-[.active]:bg-desa-black transition-setup"
            >
              <span
                class="font-medium leading-5 text-desa-secondary group-hover:text-white group-[.active]:text-white transition-setup"
              >
                Applicants ({{ jobApplicants.length || 0 }})
              </span>
            </div>
          </button>
        </div>
        <div id="Tabs-Content" class="flex flex-col">
          <!-- Bansos Tab -->
          <div v-if="activeTab === 'Bansos'" class="flex flex-col gap-6">
            <template v-if="headOfFamily.social_assistance_recipients?.length > 0">
            <div
                v-for="recipient in headOfFamily.social_assistance_recipients"
                :key="recipient.id"
              class="card flex flex-col rounded-2xl border border-desa-background p-4 gap-4"
            >
              <div class="flex items-center justify-between">
                  <p class="font-medium text-sm text-desa-secondary">
                    {{ formatToClientTimeZone(recipient.created_at) }}
                  </p>
                <img
                  src="@/assets/images/icons/calendar-2-secondary-green.svg"
                  class="flex size-[18px] shrink-0"
                  alt="icon"
                />
              </div>
              <hr class="border-desa-background" />
                <p class="font-semibold text-lg">{{ recipient.social_assistance?.name || 'Bantuan Sosial' }}</p>
              <div class="flex items-center gap-3">
                <div
                  class="flex size-[52px] shrink-0 items-center justify-center rounded-2xl bg-desa-foreshadow"
                >
                    <img 
                      :src="recipient.social_assistance?.category === 'uang' 
                        ? '/src/assets/images/icons/money-dark-green.svg' 
                        : '/src/assets/images/icons/bag-2-dark-green.svg'" 
                  alt="icon"
                />
                </div>
                <div class="flex flex-col gap-[6px] w-full">
                    <p class="font-semibold text-lg leading-5">
                      {{ recipient.social_assistance?.category === 'uang' 
                        ? `Rp${formatRupiah(recipient.amount)}` 
                        : recipient.social_assistance?.name }}
                    </p>
                    <p class="font-medium text-sm text-desa-secondary">
                      {{ recipient.social_assistance?.category === 'uang' ? 'Nominal Pengajuan' : 'Bahan Pokok' }}
                    </p>
                </div>
                <div
                    class="badge rounded-full p-3 gap-2 flex w-[100px] justify-center shrink-0"
                    :class="{
                      'bg-desa-yellow': recipient.status === 'pending',
                      'bg-desa-dark-green': recipient.status === 'approved',
                      'bg-desa-red': recipient.status === 'rejected'
                    }"
                  >
                    <span class="font-semibold text-xs text-white uppercase">
                      {{ recipient.status === 'pending' ? 'Menunggu' : recipient.status === 'approved' ? 'Diterima' : 'Ditolak' }}
                    </span>
                  </div>
              </div>
              <hr class="border-desa-background" />
              <div class="flex items-center justify-between">
                <p class="font-medium text-sm text-desa-secondary">Nominal Pengajuan:</p>
                  <p class="font-medium leading-5 text-desa-red">
                    {{ recipient.social_assistance?.category === 'uang' 
                      ? `Rp${formatRupiah(recipient.amount)}` 
                      : `${recipient.amount || '-'}` }}
                  </p>
                </div>
              </div>
            </template>
            <div v-else class="flex flex-col items-center justify-center py-12 gap-4">
              <img
                src="@/assets/images/icons/bag-cross-secondary.svg"
                class="flex size-[52px] shrink-0"
                alt="icon"
              />
              <p class="font-medium text-desa-secondary">Belum ada pengajuan bantuan sosial</p>
            </div>
          </div>
          <!-- Events Tab -->
          <div v-else-if="activeTab === 'Events'" class="flex flex-col gap-6">
            <template v-if="headOfFamily.event_participants?.length > 0">
            <div
                v-for="participant in headOfFamily.event_participants"
                :key="participant.id"
              class="card flex flex-col rounded-2xl border border-desa-background p-4 gap-4"
            >
              <div class="flex items-center justify-between">
                  <p class="font-medium text-sm text-desa-secondary">
                    {{ formatToClientTimeZone(participant.created_at) }}
                  </p>
                <img
                  src="@/assets/images/icons/calendar-2-secondary-green.svg"
                  class="flex size-[18px] shrink-0"
                  alt="icon"
                />
              </div>
              <hr class="border-desa-background" />
              <div class="flex items-center gap-3">
                <div
                  class="flex w-20 h-[60px] shrink-0 items-center justify-center rounded-2xl bg-desa-foreshadow overflow-hidden"
                >
                  <img
                      :src="participant.event?.thumbnail || '/src/assets/images/thumbnails/event-image-1.png'"
                    class="w-full h-full object-cover"
                    alt="thumbnail"
                  />
                </div>
                <div class="flex flex-col gap-[6px] w-full">
                  <p class="font-semibold leading-5 line-clamp-1">
                      {{ participant.event?.name || 'Event' }}
                  </p>
                  <div class="flex items-center gap-1">
                    <img
                      src="@/assets/images/icons/profile-2user-orange.svg"
                      class="flex size-[18px] shrink-0"
                      alt="icon"
                    />
                    <p class="font-medium text-sm text-desa-orange">
                        {{ participant.quantity || 0 }} total partisipasi
                    </p>
                    </div>
                </div>
              </div>
              <hr class="border-desa-background" />
              <div class="flex items-center justify-between">
                <p class="font-medium text-sm text-desa-secondary">Harga Event:</p>
                  <p class="font-medium leading-5 text-desa-red">
                    Rp{{ formatRupiah(participant.event?.price || 0) }}
                  </p>
                </div>
              </div>
            </template>
            <div v-else class="flex flex-col items-center justify-center py-12 gap-4">
              <img
                src="@/assets/images/icons/calendar-remove-secondary-green.svg"
                class="flex size-[52px] shrink-0"
                alt="icon"
              />
              <p class="font-medium text-desa-secondary">Belum mengikuti event apapun</p>
            </div>
          </div>
          <!-- Applicants Tab -->
          <div v-else-if="activeTab === 'Applicants'" class="flex flex-col gap-6">
            <template v-if="jobApplicants.length > 0">
              <div
                v-for="applicant in jobApplicants"
                :key="applicant.id"
                class="card flex flex-col rounded-2xl border border-desa-background p-4 gap-4"
              >
                <div class="flex items-center justify-between gap-3">
                  <div
                    class="flex w-20 h-[60px] shrink-0 items-center justify-center rounded-2xl bg-desa-foreshadow overflow-hidden"
                  >
                    <img
                      :src="applicant.job_vacancy?.thumbnail || '/src/assets/images/thumbnails/PT Cingluh.jpg'"
                      class="w-full h-full object-cover"
                      alt="thumbnail"
                    />
                  </div>
                  <div
                    class="badge rounded-full p-3 gap-2 flex w-[100px] justify-center shrink-0"
                    :class="{
                      'bg-desa-yellow': applicant.status === 'pending',
                      'bg-desa-dark-green': applicant.status === 'accepted',
                      'bg-desa-red': applicant.status === 'rejected'
                    }"
                  >
                    <span class="font-semibold text-xs text-white uppercase">
                      {{ applicant.status === 'pending' ? 'Menunggu' : applicant.status === 'accepted' ? 'Diterima' : 'Ditolak' }}
                    </span>
                  </div>
                </div>
                <div class="flex flex-col gap-1">
                  <p class="font-semibold leading-5">{{ applicant.job_vacancy?.position || 'Position' }}</p>
                  <p class="font-medium leading-5 text-desa-secondary">
                    Penanggung jawab:
                    <span class="font-semibold text-desa-dark-green">
                      {{ applicant.job_vacancy?.company || 'Company' }}
                    </span>
                  </p>
                </div>
                <hr class="border-desa-background" />
                <div class="flex items-center gap-3">
                  <div
                    class="flex size-12 shrink-0 rounded-full bg-desa-foreshadow overflow-hidden items-center justify-center"
                  >
                    <img
                      src="@/assets/images/icons/calendar-2-dark-green.svg"
                      class="flex size-6"
                      alt="icon"
                    />
                  </div>
                  <div>
                    <p class="font-semibold leading-5 text-desa-dark-green">
                      {{ formatToClientTimeZone(applicant.created_at).split(',')[0] }}
                    </p>
                    <p class="font-medium text-sm text-desa-secondary">
                      Tanggal Melamar
                    </p>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="flex flex-col items-center justify-center py-12 gap-4">
              <img
                src="@/assets/images/icons/note-remove-secondary.svg"
                class="flex size-[52px] shrink-0"
                alt="icon"
              />
              <p class="font-medium text-desa-secondary">Belum ada lamaran pekerjaan</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
  <ModalDelete
    :show="showModalDelete"
    title="Hapus Kepala keluarga?"
    :loading="loading"
    @close="showModalDelete = false"
    @confirm="handleDelete"
  />
</template>
