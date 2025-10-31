import Swal from 'sweetalert2'

/**
 * Prevent non-numeric input in number fields
 * Allows: numbers, backspace, delete, tab, escape, enter, arrows, decimal point, minus
 */
export function usePreventNonNumeric() {
  const preventNonNumeric = (event) => {
    const key = event.key
    // Allow: backspace, delete, tab, escape, enter, decimal point, minus (for negative numbers)
    if ([
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      '.',
      '-',
    ].includes(key)) {
      return
    }
    // Prevent if not a number
    if (key < '0' || key > '9') {
      event.preventDefault()
    }
  }

  return { preventNonNumeric }
}

/**
 * Show delete confirmation dialog with SweetAlert2
 */
export function useDeleteConfirmation() {
  const confirmDelete = async (options = {}) => {
    const {
      title = 'Hapus Data?',
      text = 'Data akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan!',
      confirmButtonText = 'Ya, Hapus!',
      cancelButtonText = 'Batal',
    } = options

    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText,
      cancelButtonText,
      reverseButtons: true,
    })

    return result.isConfirmed
  }

  const showSuccess = async (message = 'Data berhasil dihapus') => {
    await Swal.fire({
      title: 'Berhasil!',
      text: message,
      icon: 'success',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK',
    })
  }

  const showError = async (message = 'Gagal menghapus data') => {
    await Swal.fire({
      title: 'Gagal!',
      text: message,
      icon: 'error',
      confirmButtonColor: '#d33',
      confirmButtonText: 'OK',
    })
  }

  return { confirmDelete, showSuccess, showError }
}

