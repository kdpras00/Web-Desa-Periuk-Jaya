<script setup>
import { computed } from 'vue';

const props = defineProps({
    meta: {
        type: Object,
        required: true,
    },
    serverOptions: {
        type: Object,
        required: true,
    },
    maxVisibleButtons: {
        type: Number,
        default: 7, // Jumlah maksimal tombol pagination yang ditampilkan
    }
})

// Computed property untuk menghitung halaman mana saja yang akan ditampilkan
const visiblePages = computed(() => {
    const totalPages = props.meta?.last_page || 0;
    const currentPage = props.meta?.current_page || 1;
    const maxVisible = props.maxVisibleButtons;

    if (totalPages <= maxVisible) {
        // Jika total halaman <= maxVisible, tampilkan semua
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = currentPage - half;
    let end = currentPage + half;

    // Adjust jika start < 1
    if (start < 1) {
        start = 1;
        end = maxVisible;
    }

    // Adjust jika end > totalPages
    if (end > totalPages) {
        end = totalPages;
        start = totalPages - maxVisible + 1;
    }

    const pages = [];
    
    // Selalu tampilkan halaman pertama
    if (start > 1) {
        pages.push(1);
        if (start > 2) {
            pages.push('...'); // Ellipsis
        }
    }

    // Tampilkan halaman tengah
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    // Selalu tampilkan halaman terakhir
    if (end < totalPages) {
        if (end < totalPages - 1) {
            pages.push('...'); // Ellipsis
        }
        pages.push(totalPages);
    }

    return pages;
});
</script>

<template>
    <nav id="Pagination">
        <ul class="flex items-center gap-3">
            <li v-if="meta?.last_page > 0" class="group">
                <a 
                    @click="meta.current_page === 1 ? null : serverOptions.page = meta.current_page - 1"
                    :class="meta.current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'"
                    class="flex size-11 shrink-0 items-center justify-center rounded-full bg-desa-foreshadow group-hover:bg-desa-dark-green transition-setup">
                    <img src="@/assets/images/icons/arrow-left-dark-green.svg"
                        class="flex size-6 shrink-0 group-hover:hidden" alt="icon">
                    <img src="@/assets/images/icons/arrow-left-foreshadow.svg"
                        class="hidden size-6 shrink-0 group-hover:flex" alt="icon">
                </a>
            </li>
            <li v-for="(page, index) in visiblePages" :key="index" class="group"
                :class="{ 'active': page === meta?.current_page }">
                <!-- Ellipsis -->
                <span v-if="page === '...'" 
                    class="flex size-11 shrink-0 items-center justify-center text-desa-secondary font-semibold">
                    ...
                </span>
                <!-- Page number -->
                <a v-else
                    @click="serverOptions.page = page"
                    class="flex size-11 shrink-0 items-center justify-center rounded-full bg-desa-foreshadow group-hover:bg-desa-dark-green group-[.active]:bg-desa-dark-green transition-setup cursor-pointer">
                    <span
                        class="text-desa-dark-green font-semibold group-[.active]:text-desa-foreshadow group-hover:text-desa-foreshadow transition-setup">
                        {{ page }}
                    </span>
                </a>
            </li>
            <li v-if="meta?.last_page > 0" class="group">
                <a 
                    @click="meta.current_page === meta.last_page ? null : serverOptions.page = meta.current_page + 1"
                    :class="meta.current_page === meta.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'"
                    class="flex size-11 shrink-0 items-center justify-center rounded-full bg-desa-foreshadow group-hover:bg-desa-dark-green transition-setup">
                    <img src="@/assets/images/icons/arrow-left-dark-green.svg"
                        class="flex size-6 shrink-0 rotate-180 group-hover:hidden" alt="icon">
                    <img src="@/assets/images/icons/arrow-left-foreshadow.svg"
                        class="hidden size-6 shrink-0 rotate-180 group-hover:flex" alt="icon">
                </a>
            </li>
        </ul>
    </nav>
</template>