import Swal from 'sweetalert2'

// Custom SweetAlert configurations for consistent styling
const defaultConfig = {
  confirmButtonColor: '#10B981', // desa-dark-green
  cancelButtonColor: '#6B7280',   // gray-500
}

export const showLoading = (title = 'Memproses...', text = 'Mohon tunggu sebentar') => {
  return Swal.fire({
    title,
    html: text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })
}

export const showSuccess = (title = 'Berhasil!', text = '', timer = 1500) => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    timer,
    showConfirmButton: timer ? false : true,
    allowOutsideClick: false,
    ...defaultConfig
  })
}

export const showError = (title = 'Terjadi Kesalahan!', text = '', confirmButtonText = 'OK') => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText,
    ...defaultConfig
  })
}

export const showWarning = (title = 'Peringatan!', text = '', confirmButtonText = 'OK') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonText,
    ...defaultConfig
  })
}

export const showConfirm = (
  title = 'Apakah Anda yakin?',
  text = '',
  confirmButtonText = 'Ya',
  cancelButtonText = 'Batal'
) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    ...defaultConfig
  })
}

export const showDeleteConfirm = (itemName = 'data ini') => {
  return Swal.fire({
    title: 'Hapus Data?',
    text: `Apakah Anda yakin ingin menghapus ${itemName}? Data yang dihapus tidak dapat dikembalikan.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#EF4444', // red-500
    cancelButtonColor: '#6B7280',
  })
}

export const showInfo = (title = 'Informasi', text = '', confirmButtonText = 'OK') => {
  return Swal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonText,
    ...defaultConfig
  })
}

// Special alerts for auth
export const showLoginSuccess = () => {
  return showSuccess('Login Berhasil!', 'Selamat datang kembali')
}

export const showLoginError = (errorMessage = 'Email atau password salah') => {
  return showError('Login Gagal!', errorMessage, 'Coba Lagi')
}

export const showLogoutConfirm = () => {
  return showConfirm(
    'Konfirmasi Logout',
    'Apakah Anda yakin ingin keluar?',
    'Ya, Keluar',
    'Batal'
  )
}

export const showLogoutSuccess = () => {
  return showSuccess('Berhasil Logout', 'Sampai jumpa lagi!', 1500)
}

// Toast notifications (for non-intrusive notifications)
export const showToast = (icon = 'success', title = '', position = 'top-end', timer = 3000) => {
  return Swal.fire({
    icon,
    title,
    toast: true,
    position,
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })
}

export default {
  showLoading,
  showSuccess,
  showError,
  showWarning,
  showConfirm,
  showDeleteConfirm,
  showInfo,
  showLoginSuccess,
  showLoginError,
  showLogoutConfirm,
  showLogoutSuccess,
  showToast
}

