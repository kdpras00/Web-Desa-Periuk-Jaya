# 🎯 Filter Feature Documentation

Dokumentasi lengkap implementasi fitur filter untuk semua modul dalam aplikasi Kelurahan Digital.

---

## ✨ Fitur yang Diimplementasikan

### 1. **Kepala Rumah (Head of Family)**
**Halaman:** `fe-periukJaya/src/views/head-of-family/HeadOfFamilies.vue`

**Filter yang tersedia:**
- ✅ **Jenis Kelamin** (Radio)
  - Laki-laki
  - Perempuan
- ✅ **Status Pernikahan** (Dropdown)
  - Belum Menikah
  - Menikah
  - Cerai
  - Janda/Duda
- ✅ **Pekerjaan** (Text Input)

---

### 2. **List Bantuan Sosial (Social Assistance)**
**Halaman:** `fe-periukJaya/src/views/social-assistance/SocialAssistances.vue`

**Filter yang tersedia:**
- ✅ **Kategori** (Dropdown)
  - Sembako
  - Bantuan Tunai
  - Pendidikan
  - Kesehatan
  - Perumahan
  - Lainnya
- ✅ **Penyedia** (Text Input)
- ✅ **Status Ketersediaan** (Radio)
  - Tersedia
  - Tidak Tersedia

---

### 3. **Pengajuan Bansos (Social Assistance Recipients)**
**Halaman:** `fe-periukJaya/src/views/social-assistance-recipient/SocialAssistanceRecipients.vue`

**Filter yang tersedia:**
- ✅ **Status Pengajuan** (Dropdown)
  - Menunggu
  - Disetujui
  - Ditolak
- ✅ **Bank** (Dropdown)
  - BRI, BNI, Mandiri, BCA, BSI, BTN, Lainnya

---

### 4. **Lowongan Pekerjaan (Job Vacancy)**
**Halaman:** `fe-periukJaya/src/views/job-vacancy/JobVacancies.vue`

**Filter yang tersedia:**
- ✅ **Status Lowongan** (Dropdown)
  - Buka
  - Tutup
  - Terisi
- ✅ **Perusahaan** (Text Input)
- ✅ **Range Gaji** (Number Range)
  - Min - Max

---

### 5. **Event Desa**
**Halaman:** `fe-periukJaya/src/views/event/Events.vue`

**Filter yang tersedia:**
- ✅ **Status Event** (Radio)
  - Aktif
  - Tidak Aktif
- ✅ **Tanggal Mulai** (Date Picker)
- ✅ **Tanggal Selesai** (Date Picker)
- ✅ **Range Harga Tiket** (Number Range)
  - Min - Max

---

## 🎨 Komponen Reusable

### **FilterModal.vue**
Lokasi: `fe-periukJaya/src/components/ui/FilterModal.vue`

Komponen modal filter yang dapat digunakan kembali untuk semua halaman dengan berbagai tipe filter:

**Tipe Filter yang Didukung:**
1. **Select** - Dropdown selection
2. **Radio** - Radio buttons
3. **Date** - Date picker
4. **Range** - Number range (min-max)
5. **Text** - Text input

**Props:**
- `modelValue` (Boolean) - Kontrol modal open/close
- `filters` (Object) - Filter values
- `filterConfig` (Array) - Konfigurasi filter fields

**Events:**
- `@apply` - Emit saat user apply filters
- `@reset` - Emit saat user reset filters
- `@update:modelValue` - Emit untuk close modal

**Fitur:**
- ✨ Beautiful UI dengan transisi smooth
- ✨ Badge counter untuk menampilkan jumlah filter aktif
- ✨ Auto-teleport ke body (tidak terpengaruh overflow parent)
- ✨ Responsive design

---

## 🚀 Cara Menggunakan Filter

### **Frontend Implementation**

```vue
<script setup>
import FilterModal from '@/components/ui/FilterModal.vue'

const filters = ref({
  search: null,
  category: null,
  status: null,
})

const showFilterModal = ref(false)
const activeFiltersCount = ref(0)

const filterConfig = [
  {
    key: 'category',
    label: 'Kategori',
    type: 'select',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    type: 'radio',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
]

const applyFilters = (newFilters) => {
  filters.value = {
    ...filters.value,
    ...newFilters,
  }
  updateActiveFiltersCount()
}

const resetFilters = (resetValues) => {
  filters.value = {
    search: filters.value.search, // Keep search
    ...resetValues,
  }
  updateActiveFiltersCount()
}

const updateActiveFiltersCount = () => {
  activeFiltersCount.value = Object.entries(filters.value).filter(
    ([key, value]) => key !== 'search' && value !== null && value !== ''
  ).length
}
</script>

<template>
  <!-- Filter Button -->
  <button
    type="button"
    @click="showFilterModal = true"
    class="flex items-center gap-1 h-14 w-fit rounded-2xl border border-desa-background bg-white py-4 px-6 hover:bg-desa-background transition-colors relative"
  >
    <img src="@/assets/images/icons/filter-black.svg" class="flex size-6 shrink-0" alt="icon" />
    <span class="font-medium leading-5">Filter</span>
    
    <!-- Badge counter -->
    <span
      v-if="activeFiltersCount > 0"
      class="absolute -top-2 -right-2 bg-desa-dark-green text-white text-xs font-bold rounded-full size-6 flex items-center justify-center"
    >
      {{ activeFiltersCount }}
    </span>
  </button>

  <!-- Filter Modal -->
  <FilterModal
    v-model="showFilterModal"
    :filters="filters"
    :filterConfig="filterConfig"
    @apply="applyFilters"
    @reset="resetFilters"
  />
</template>
```

---

## 🔧 Backend Implementation

### **Repository Pattern**

Semua repository telah diupdate untuk mendukung filter:

```php
public function getAll(
    ?string $search,
    ?int $limit,
    bool $execute,
    array $filters = []) {
    
    $query = Model::where(function ($query) use ($search) {
        if ($search) {
            $query->search($search);
        }
    });

    // Filter berdasarkan field
    if (isset($filters['field']) && $filters['field']) {
        $query->where('field', $filters['field']);
    }

    // Filter berdasarkan range
    if (isset($filters['min']) && $filters['min']) {
        $query->where('value', '>=', $filters['min']);
    }
    if (isset($filters['max']) && $filters['max']) {
        $query->where('value', '<=', $filters['max']);
    }

    return $query;
}

public function getAllPaginated(
    ?string $search,
    ?int $rowPerPage,
    array $filters = []) {
    
    $query = $this->getAll($search, $rowPerPage, false, $filters);
    return $query->paginate($rowPerPage);
}
```

### **Controller Pattern**

```php
public function getAllPaginated(Request $request)
{
    $request = $request->validate([
        'search'       => 'nullable|string',
        'row_per_page' => 'required|integer',
        'filter_field' => 'nullable|string',
        // ... other filters
    ]);

    try {
        // Pisahkan filter dari parameter lainnya
        $filters = [
            'filter_field' => $request['filter_field'] ?? null,
            // ... other filters
        ];

        $data = $this->repository->getAllPaginated(
            $request['search'] ?? null,
            $request['row_per_page'],
            $filters
        );

        return ResponseHelper::jsonResponse(true, 'Success', $data, 200);
    } catch (\Exception $e) {
        return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
    }
}
```

---

## 📂 File yang Dimodifikasi/Dibuat

### **Frontend (Vue.js)**

#### **Komponen Baru:**
1. ✅ `fe-periukJaya/src/components/ui/FilterModal.vue`

#### **Views yang Diupdate:**
1. ✅ `fe-periukJaya/src/views/head-of-family/HeadOfFamilies.vue`
2. ✅ `fe-periukJaya/src/views/social-assistance/SocialAssistances.vue`
3. ✅ `fe-periukJaya/src/views/social-assistance-recipient/SocialAssistanceRecipients.vue`
4. ✅ `fe-periukJaya/src/views/job-vacancy/JobVacancies.vue`
5. ✅ `fe-periukJaya/src/views/event/Events.vue`

### **Backend (Laravel)**

#### **Repositories yang Diupdate:**
1. ✅ `kelurahan-digital/app/Repositories/HeadOfFamilyRepository.php`
2. ✅ `kelurahan-digital/app/Repositories/SocialAssistanceRepository.php`
3. ✅ `kelurahan-digital/app/Repositories/SocialAssistanceRecipientRepository.php`
4. ✅ `kelurahan-digital/app/Repositories/JobVacancyRepository.php`
5. ✅ `kelurahan-digital/app/Repositories/EventRepository.php`

#### **Controllers yang Diupdate:**
1. ✅ `kelurahan-digital/app/Http/Controllers/HeadOfFamilyController.php`
2. ✅ `kelurahan-digital/app/Http/Controllers/SocialAssistanceController.php`
3. ✅ `kelurahan-digital/app/Http/Controllers/SocialAssistanceRecipientController.php`
4. ✅ `kelurahan-digital/app/Http/Controllers/JobVacancyController.php`
5. ✅ `kelurahan-digital/app/Http/Controllers/EventController.php`

---

## 🎯 Fitur Tambahan yang Diimplementasikan

### **1. Badge Counter**
- Menampilkan jumlah filter yang aktif
- Update real-time saat apply/reset filter
- Visual indicator yang jelas untuk user

### **2. Loading State**
- Skeleton loading animation
- Disable input saat loading
- Better UX experience

### **3. Empty State**
- Tampilan informatif saat tidak ada data
- Pesan yang berbeda untuk filtered vs unfiltered state

### **4. Performance Optimization**
- Debounce 300ms untuk search & filter
- Request cancellation dengan AbortController
- Auto reset page to 1 saat filter berubah

---

## 🧪 Testing

### **Cara Test Filter:**

1. **Buka salah satu halaman yang sudah diupdate**
2. **Klik tombol "Filter"**
3. **Pilih filter yang diinginkan**
4. **Klik "Terapkan Filter"**
5. **Verifikasi:**
   - Badge counter muncul dengan angka yang benar
   - Data ter-filter sesuai kriteria
   - Loading state berjalan smooth
   - Empty state muncul jika tidak ada data

### **Test Cases:**

✅ Single filter
✅ Multiple filters kombinasi
✅ Reset filter
✅ Filter + Search
✅ Filter + Pagination
✅ Empty result handling
✅ Loading state
✅ Badge counter accuracy

---

## 📝 API Request Format

### **Example Request:**

```javascript
// GET /api/social-assistance/all/paginated
{
  search: "bantuan",
  row_per_page: 10,
  page: 1,
  category: "Sembako",
  provider: "Pemerintah",
  is_available: 1
}
```

### **Example Response:**

```json
{
  "success": true,
  "message": "Data Bansos Berhasil Diambil",
  "data": {
    "data": [...],
    "meta": {
      "current_page": 1,
      "last_page": 5,
      "per_page": 10,
      "total": 47
    }
  }
}
```

---

## 🎨 UI/UX Improvements

### **Before:**
- ❌ Tombol filter tidak berfungsi
- ❌ Tidak ada loading indicator
- ❌ Tidak ada empty state
- ❌ User tidak tahu berapa filter yang aktif

### **After:**
- ✅ Tombol filter fully functional
- ✅ Beautiful modal dengan smooth animation
- ✅ Skeleton loading state
- ✅ Informative empty state
- ✅ Badge counter untuk filter aktif
- ✅ Disable input saat loading
- ✅ Better user experience overall

---

## 🚀 Future Enhancements (Optional)

Beberapa ide untuk pengembangan lebih lanjut:

1. **Preset Filters** - Save/load filter presets
2. **Export Filtered Data** - Export ke Excel/PDF
3. **URL State** - Simpan filter di URL untuk sharing
4. **Advanced Date Range** - Custom date range picker
5. **Multi-Select Filters** - Pilih multiple options
6. **Filter Analytics** - Track filter usage statistics

---

## 📞 Support

Jika ada pertanyaan atau issue terkait filter feature:
1. Check dokumentasi ini terlebih dahulu
2. Lihat console log untuk error details
3. Check network tab untuk API response
4. Verify filter params di payload request

---

**Created:** October 29, 2025  
**Last Updated:** October 29, 2025  
**Status:** ✅ Production Ready  
**Coverage:** 5 Modules (Head of Family, Social Assistance, Recipients, Job Vacancy, Events)

