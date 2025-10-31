# Dokumentasi Fitur Notifikasi

## Ringkasan
Fitur notifikasi memungkinkan sistem untuk mengirimkan pemberitahuan kepada user (Lurah maupun Kepala Keluarga) berdasarkan aktivitas dan event yang relevan dengan role mereka.

## Struktur Database

### Tabel `notifications`
- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key ke tabel users)
- **type**: String (social-assistance, event, job-vacancy, family, system)
- **title**: String (Judul notifikasi)
- **message**: Text (Isi pesan notifikasi)
- **link**: String nullable (URL untuk redirect saat notifikasi diklik)
- **is_read**: Boolean (Status sudah dibaca atau belum)
- **read_at**: Timestamp nullable (Waktu notifikasi dibaca)
- **created_at**: Timestamp
- **updated_at**: Timestamp

### Indexes
- `user_id, is_read` - Untuk query notifikasi unread per user
- `created_at` - Untuk sorting berdasarkan waktu

## Backend

### Model: `Notification`
**Path**: `kelurahan-digital/app/Models/Notification.php`

**Features**:
- Menggunakan trait UUID
- Relasi belongsTo dengan User
- Scope untuk unread dan read notifications
- Method `markAsRead()` untuk menandai notifikasi sebagai sudah dibaca

### Repository Interface: `NotificationRepositoryInterface`
**Path**: `kelurahan-digital/app/Interfaces/NotificationRepositoryInterface.php`

**Methods**:
- `getAllForUser(string $userId)` - Get semua notifikasi untuk user
- `getUnreadCount(string $userId)` - Hitung jumlah notifikasi yang belum dibaca
- `markAsRead(string $notificationId)` - Tandai notifikasi sebagai dibaca
- `markAllAsReadForUser(string $userId)` - Tandai semua notifikasi user sebagai dibaca
- `delete(string $notificationId)` - Hapus notifikasi
- `create(array $data)` - Buat notifikasi baru

### Repository: `NotificationRepository`
**Path**: `kelurahan-digital/app/Repositories/NotificationRepository.php`

Implementasi dari NotificationRepositoryInterface dengan query optimization.

### Controller: `NotificationController`
**Path**: `kelurahan-digital/app/Http/Controllers/NotificationController.php`

**Endpoints**:
- `GET /api/notifications` - Get semua notifikasi untuk user yang login
- `GET /api/notifications/unread-count` - Get jumlah notifikasi yang belum dibaca
- `PUT /api/notifications/{id}/read` - Tandai notifikasi sebagai dibaca
- `PUT /api/notifications/mark-all-read` - Tandai semua notifikasi sebagai dibaca
- `DELETE /api/notifications/{id}` - Hapus notifikasi

### Resource: `NotificationResource`
**Path**: `kelurahan-digital/app/Http/Resources/NotificationResource.php`

Transform data notifikasi untuk response API.

## Frontend

### Store: `notification.js`
**Path**: `fe-periukJaya/src/stores/notification.js`

**State**:
- `notifications` - Array of notifications
- `unreadCount` - Jumlah notifikasi yang belum dibaca
- `loading` - Loading state
- `error` - Error state

**Actions**:
- `fetchNotifications()` - Fetch semua notifikasi dari API
- `markAsRead(notificationId)` - Tandai notifikasi sebagai dibaca
- `markAllAsRead()` - Tandai semua notifikasi sebagai dibaca
- `deleteNotification(notificationId)` - Hapus notifikasi
- `addNotification(notification)` - Tambahkan notifikasi baru (untuk real-time updates di masa depan)

### Component: `NotificationDropdown.vue`
**Path**: `fe-periukJaya/src/components/NotificationDropdown.vue`

**Features**:
- Dropdown UI untuk menampilkan notifikasi
- Badge counter untuk notifikasi yang belum dibaca
- Icon berbeda untuk setiap tipe notifikasi
- Format waktu relatif (baru saja, 5 menit lalu, dll)
- Highlight untuk notifikasi yang belum dibaca
- Click handler untuk navigasi ke halaman terkait
- Delete button per notifikasi
- Mark all as read button

**Props**: None (menggunakan Pinia store)

**Emits**: None

### Integration: `Topbar.vue`
**Path**: `fe-periukJaya/src/components/Topbar.vue`

NotificationDropdown telah diintegrasikan ke dalam Topbar, menggantikan tombol notifikasi statis sebelumnya.

## Tipe Notifikasi

### 1. Social Assistance (`social-assistance`)
**Untuk Lurah**:
- Pengajuan bantuan sosial baru
- Status pengajuan diubah

**Untuk Kepala Keluarga**:
- Pengajuan disetujui/ditolak
- Bantuan sosial baru tersedia

**Icon**: `receipt-search-secondary-green.svg`

### 2. Event (`event`)
**Untuk Lurah**:
- Event baru dibuat
- Peserta event bertambah

**Untuk Kepala Keluarga**:
- Undangan event baru
- Reminder event

**Icon**: `calendar-search-secondary-green.svg`

### 3. Job Vacancy (`job-vacancy`)
**Untuk Lurah**:
- Lamaran pekerjaan baru
- Status lamaran diubah

**Untuk Kepala Keluarga**:
- Lowongan pekerjaan baru
- Status lamaran diubah

**Icon**: `box-search-secondary-green.svg`

### 4. Family (`family`)
**Untuk Lurah**:
- Data kepala keluarga baru
- Data anggota keluarga diubah

**Untuk Kepala Keluarga**:
- Data keluarga diperbarui
- Anggota keluarga baru ditambahkan

**Icon**: `user-search-secondary-green.svg`

### 5. System (`system`)
**Untuk Semua**:
- Pembaruan sistem
- Maintenance notification
- Welcome message

**Icon**: `notification-secondary-green.svg`

## Seeder

### `NotificationSeeder`
**Path**: `kelurahan-digital/database/seeders/NotificationSeeder.php`

Membuat contoh notifikasi untuk user Lurah dan Kepala Keluarga dengan berbagai tipe dan status (read/unread).

## Cara Menggunakan

### 1. Menampilkan Notifikasi
Komponen `NotificationDropdown` sudah otomatis terintegrasi di Topbar. Notifikasi akan di-fetch saat component di-mount.

### 2. Menambahkan Notifikasi Baru (Backend)
```php
use App\Models\Notification;

Notification::create([
    'user_id' => $userId,
    'type' => 'social-assistance',
    'title' => 'Pengajuan Baru',
    'message' => 'Ada pengajuan bantuan sosial baru',
    'link' => '/social-assistance-recipient',
    'is_read' => false,
]);
```

### 3. Trigger Notifikasi dari Event
Untuk implementasi di masa depan, buat event listener yang akan create notification saat ada action tertentu:

```php
// Contoh: Saat social assistance recipient dibuat
// Di SocialAssistanceRecipientRepository atau Controller

// Get lurah users
$lurahs = User::role('lurah')->get();

foreach ($lurahs as $lurah) {
    Notification::create([
        'user_id' => $lurah->id,
        'type' => 'social-assistance',
        'title' => 'Pengajuan Bantuan Sosial Baru',
        'message' => "Pengajuan bantuan sosial baru dari {$headOfFamily->name}",
        'link' => '/social-assistance-recipient',
        'is_read' => false,
    ]);
}
```

## Customization

### Menambahkan Tipe Notifikasi Baru

1. **Frontend**: Update `getNotificationIcon()` di `NotificationDropdown.vue`
```javascript
const iconMap = {
  'new-type': 'new-icon-name',
  // ... existing types
}
```

2. **Backend**: Tidak ada perubahan khusus diperlukan, karena `type` adalah string biasa

### Mengubah Durasi Format Waktu
Edit function `formatTime()` di `NotificationDropdown.vue` sesuai kebutuhan.

### Menambahkan Filter Notifikasi
Bisa ditambahkan filter berdasarkan tipe atau status di component `NotificationDropdown.vue`.

## Testing

### Manual Testing
1. Login sebagai Lurah (email: `lurah@gmail.com`, password: `password`)
   - Klik icon notifikasi di Topbar
   - Verifikasi notifikasi muncul dengan benar
   - Test mark as read, mark all as read, dan delete

2. Login sebagai Kepala Keluarga (email: `headoffamily@gmail.com`, password: `password`)
   - Klik icon notifikasi di Topbar
   - Verifikasi notifikasi berbeda dengan Lurah
   - Test fitur yang sama

### API Testing
```bash
# Get notifications
curl -X GET http://localhost:8000/api/notifications \
  -H "Authorization: Bearer {token}"

# Mark as read
curl -X PUT http://localhost:8000/api/notifications/{id}/read \
  -H "Authorization: Bearer {token}"

# Mark all as read
curl -X PUT http://localhost:8000/api/notifications/mark-all-read \
  -H "Authorization: Bearer {token}"

# Delete notification
curl -X DELETE http://localhost:8000/api/notifications/{id} \
  -H "Authorization: Bearer {token}"
```

## Future Enhancements

1. **Real-time Notifications**: 
   - Implementasi WebSocket atau Pusher untuk notifikasi real-time
   - Update `addNotification()` action di store untuk handle incoming notifications

2. **Email Notifications**:
   - Kirim email untuk notifikasi penting
   - Setting preferences untuk tipe notifikasi yang ingin diterima via email

3. **Push Notifications**:
   - Implementasi web push notifications
   - Service worker untuk notifikasi browser

4. **Notification Preferences**:
   - User bisa customize tipe notifikasi yang ingin diterima
   - Mute notifications untuk periode tertentu

5. **Notification History**:
   - Halaman khusus untuk melihat semua notifikasi
   - Pagination dan filtering

6. **Notification Grouping**:
   - Group notifikasi yang sejenis
   - "5 pengajuan bantuan sosial baru" instead of 5 separate notifications

## Troubleshooting

### Notifikasi tidak muncul
1. Pastikan migration sudah dijalankan: `php artisan migrate`
2. Pastikan seeder sudah dijalankan: `php artisan db:seed --class=NotificationSeeder`
3. Check console browser untuk error API
4. Verify token authentication di request header

### Badge counter tidak update
1. Pastikan `fetchNotifications()` dipanggil saat component mount
2. Check apakah `unreadCount` di-compute dengan benar di store
3. Verify API endpoint `/notifications` return data yang benar

### Icon tidak muncul
1. Pastikan icon files ada di `fe-periukJaya/src/assets/images/icons/`
2. Check `getNotificationIcon()` function return path yang benar
3. Verify import.meta.url working correctly

## Migration

Migration file: `2025_10_29_171140_create_notifications_table.php`

Untuk rollback:
```bash
php artisan migrate:rollback --step=1
```

## Kesimpulan

Fitur notifikasi sekarang sudah lengkap dan berfungsi untuk kedua role (Lurah dan Kepala Keluarga). Notifikasi akan ditampilkan sesuai dengan role masing-masing user, dan tersedia berbagai tipe notifikasi untuk berbagai aktivitas dalam sistem.

