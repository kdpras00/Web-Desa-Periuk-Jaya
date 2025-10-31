<script setup>
import ModalDelete from "@/components/ui/ModalDelete.vue";
import { ucfirst } from "@/helpers/format";
import { useDeleteConfirmation } from "@/composables/useFormHelpers";

import { useFamilyMemberStore } from "@/stores/familyMember";
import { useJobVacancyApplicantStore } from "@/stores/jobApplicant";
import { storeToRefs } from "pinia";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import router from "@/router";

const route = useRoute();
const { confirmDelete, showSuccess, showError } = useDeleteConfirmation();

const familyMember = ref({});
const familyMemberStore = useFamilyMemberStore();
const { loading } = storeToRefs(familyMemberStore);
const { fetchFamilyMember, deleteFamilyMember } = familyMemberStore;

const jobApplicantStore = useJobVacancyApplicantStore();
const { recentApplicants, loading: applicantsLoading } = storeToRefs(jobApplicantStore);
const { fetchJobApplicantsByUser } = jobApplicantStore;

const fetchData = async () => {
  const response = await fetchFamilyMember(route.params.id);
  familyMember.value = response;
  
  // Fetch job applicants for this family member
  if (response?.user_id) {
    await fetchJobApplicantsByUser(response.user_id);
  }
};

const showModalDelete = ref(false);

async function handleDelete() {
  const confirmed = await confirmDelete({
    title: 'Hapus Anggota Keluarga?',
    text: 'Data anggota keluarga akan dihapus secara permanen.',
  });
  
  if (!confirmed) return;
  
  try {
    await deleteFamilyMember(route.params.id);
    await showSuccess('Anggota keluarga berhasil dihapus');
    router.push({ name: "family-member" });
  } catch (error) {
    await showError(error.message || 'Gagal menghapus anggota keluarga');
  }
}

const calculateAge = (dateString) => {
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const getStatusClass = (status) => {
  const statusMap = {
    'pending': 'menunggu',
    'accepted': 'diterima',
    'rejected': 'ditolak'
  };
  return statusMap[status] || 'menunggu';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

onMounted(fetchData);
</script>

<template>
  <header class="flex items-center justify-between">
    <div class="flex flex-col gap-2">
      <p class="flex items-center gap-1">
        <span class="leading-5 text-desa-secondary">Kepala Keluarga</span
        ><span class="font-medium leading-5 text-desa-dark-green">/</span
        ><span class="font-medium leading-5 text-desa-dark-green"
          >Manage Anggota Keluarga</span
        >
      </p>
      <h1 class="font-semibold text-2xl leading-[30px]">Manage Anggota Keluarga</h1>
    </div>
    <button
      data-modal="Modal-Delete"
      class="px-6 py-4 rounded-2xl bg-desa-red flex items-center gap-[10px]"
      @click="showModalDelete = true"
    >
      <p class="font-medium leading-5 text-white">Hapus Data</p>
      <img
        src="@/assets/images/icons/trash-white.svg"
        alt="icon"
        class="size-5 shrink-0"
      />
    </button>
  </header>
  <div class="flex gap-[14px]">
    <div
      class="shrink-0 rounded-3xl p-6 bg-white flex flex-col gap-6 h-fit w-[calc(520/1000*100%)]"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="flex size-[76px] shrink-0 rounded-full overflow-hidden bg-desa-foreshadow"
          >
            <img
              :src="familyMember.profile_picture"
              class="w-full h-full object-cover"
              alt="photo"
            />
          </div>
          <div class="flex flex-col gap-[6px]">
            <h3 class="font-semibold text-xl leading-[25px]">
              {{ familyMember.user?.name }}
            </h3>
            <div class="flex items-center gap-1">
              <img
                src="@/assets/images/icons/briefcase-secondary-green.svg"
                alt="icon"
                class="size-[18px] shrink-0"
              />
              <p class="font-medium text-sm leading-[17.5px] text-desa-secondary">
                {{ familyMember.occupation }}
              </p>
            </div>
          </div>
        </div>
        <span
          class="menikah [&.menikah]:flex hidden rounded-full py-[12px] w-[100px] justify-center bg-desa-soft-green text-white font-semibold text-xs leading-[15px] shrink-0"
          >MENIKAH</span
        >
      </div>
      <hr class="border-desa-background" />
      <div class="flex items-center gap-3">
        <div class="p-[14px] rounded-2xl bg-desa-foreshadow shrink-0">
          <img
            src="@/assets/images/icons/keyboard-dark-green.svg"
            alt="icon"
            class="size-6 shrink-0"
          />
        </div>
        <div class="flex flex-col gap-1">
          <p class="font-semibold text-lg leading-[22.5px]">
            {{ familyMember.identity_number }}
          </p>
          <h4 class="font-medium leading-5 text-desa-secondary">
            Nomor Induk Kependudukan
          </h4>
        </div>
      </div>
      <hr class="border-desa-background" />
      <div class="flex items-center gap-3">
        <div class="p-[14px] rounded-2xl bg-desa-foreshadow shrink-0">
          <img
            src="@/assets/images/icons/user-square-dark-green.svg"
            alt="icon"
            class="size-6 shrink-0"
          />
        </div>
        <div class="flex flex-col gap-1">
          <p class="font-semibold text-lg leading-[22.5px]">
            {{ calculateAge(familyMember.date_of_birth) }} Tahun
          </p>
          <h4 class="font-medium leading-5 text-desa-secondary">Umur</h4>
        </div>
      </div>
      <hr class="border-desa-background" />
      <div class="flex items-center gap-3">
        <div class="p-[14px] rounded-2xl bg-desa-foreshadow shrink-0">
          <img
            src="@/assets/images/icons/calendar-2-dark-green.svg"
            alt="icon"
            class="size-6 shrink-0"
          />
        </div>
        <div class="flex flex-col gap-1">
          <p class="font-semibold text-lg leading-[22.5px]">
            {{ familyMember.date_of_birth }}
          </p>
          <h4 class="font-medium leading-5 text-desa-secondary">Tanggal Lahir</h4>
        </div>
      </div>
      <hr class="border-desa-background" />
      <div class="flex items-center gap-3">
        <div class="p-[14px] rounded-2xl bg-desa-foreshadow shrink-0">
          <img
            src="@/assets/images/icons/man-dark-green.svg"
            alt="icon"
            class="size-6 shrink-0"
          />
        </div>
        <div class="flex flex-col gap-1">
          <p class="font-semibold text-lg leading-[22.5px]">{{ familyMember.gender }}</p>
          <h4 class="font-medium leading-5 text-desa-secondary">Jenis Kelamin</h4>
        </div>
      </div>
      <hr class="border-desa-background" />
      <div class="flex items-center gap-3">
        <div class="p-[14px] rounded-2xl bg-desa-foreshadow shrink-0">
          <img
            src="@/assets/images/icons/sms-dark-green.svg"
            alt="icon"
            class="size-6 shrink-0"
          />
        </div>
        <div class="flex flex-col gap-1">
          <p class="font-semibold text-lg leading-[22.5px]">
            {{ familyMember.user?.email }}
          </p>
          <h4 class="font-medium leading-5 text-desa-secondary">Email Address</h4>
        </div>
      </div>
      <hr class="border-desa-background" />
      <div class="flex items-center gap-3">
        <div class="p-[14px] rounded-2xl bg-desa-foreshadow shrink-0">
          <img
            src="@/assets/images/icons/call-dark-green.svg"
            alt="icon"
            class="size-6 shrink-0"
          />
        </div>
        <div class="flex flex-col gap-1">
          <p class="font-semibold text-lg leading-[22.5px]">
            {{ familyMember.phone_number }}
          </p>
          <h4 class="font-medium leading-5 text-desa-secondary">Nomor Hp</h4>
        </div>
      </div>
    </div>
    <div class="flex-1 rounded-3xl p-6 bg-white flex flex-col gap-6">
      <h2 class="font-medium leading-5 text-desa-secondary">Recent Applicants</h2>
      
      <!-- Loading State -->
      <div v-if="applicantsLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-desa-dark-green"></div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!recentApplicants || recentApplicants.length === 0"
        class="flex flex-col items-center justify-center py-12 gap-4"
      >
        <img
          src="@/assets/images/icons/note-remove-secondary.svg"
          class="size-[52px] shrink-0"
          alt="icon"
        />
        <p class="font-medium leading-5 text-center text-desa-secondary">
          Belum ada lamaran pekerjaan
        </p>
      </div>

      <!-- Applicants List -->
      <template v-else>
        <div
          v-for="applicant in recentApplicants"
          :key="applicant.id"
          class="applicant rounded-2xl border border-desa-background p-6 flex flex-col gap-6"
        >
          <div class="flex items-center justify-between">
            <div
              class="flex items-center justify-center w-[100px] h-[80px] rounded-2xl overflow-hidden bg-desa-foreshadow"
            >
              <img
                :src="applicant.job_vacancy?.thumbnail || '@/assets/images/thumbnails/PT Panarub.jpeg'"
                alt="image"
                class="size-full object-cover"
              />
            </div>
            <div class="group" :class="getStatusClass(applicant.status)">
              <span
                class="group-[&.menunggu]:flex hidden rounded-full py-[12px] w-[100px] justify-center bg-desa-yellow text-white font-semibold text-xs leading-[15px] shrink-0"
                >MENUNGGU</span
              >
              <span
                class="group-[&.ditolak]:flex hidden rounded-full py-[12px] w-[100px] justify-center bg-desa-red text-white font-semibold text-xs leading-[15px] shrink-0"
                >DITOLAK</span
              >
              <span
                class="group-[&.diterima]:flex hidden rounded-full py-[12px] w-[100px] justify-center bg-desa-dark-green text-white font-semibold text-xs leading-[15px] shrink-0"
                >DITERIMA</span
              >
            </div>
          </div>
          <div>
            <h3 class="font-semibold text-lg leading-[22.5px] line-clamp-1">
              {{ applicant.job_vacancy?.position || 'N/A' }}
            </h3>
            <div class="flex items-center gap-1">
              <p class="font-medium leading-5 text-desa-secondary">Perusahaan:</p>
              <p class="font-semibold leading-5 text-desa-dark-green line-clamp-1">
                {{ applicant.job_vacancy?.company || 'N/A' }}
              </p>
            </div>
          </div>
          <hr class="border-desa-background" />
          <div class="flex items-center gap-[12px]">
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
                {{ formatDate(applicant.created_at) }}
              </p>
              <h4 class="font-medium text-sm leading-[17.5px] text-desa-secondary">
                Tanggal Melamar
              </h4>
            </div>
          </div>
          <hr class="border-desa-background" />
          <RouterLink :to="{ name: 'job-vacancy-details', params: { id: applicant.job_vacancy?.id } }">
            <div
              class="w-full p-[18px] rounded-2xl bg-desa-dark-green hover:bg-desa-dark-green/90 transition-all flex items-center justify-center text-white font-medium leading-5"
            >
              View Details
            </div>
          </RouterLink>
        </div>
      </template>
    </div>
  </div>

  <ModalDelete
    :show="showModalDelete"
    title="Hapus Anggota keluarga?"
    :loading="loading"
    @close="showModalDelete = false"
    @confirm="handleDelete"
  />
</template>
