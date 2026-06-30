function getAlertTheme() {
  const isDark = document.documentElement.dataset.theme === 'dark'
  return {
    background: isDark ? '#141616' : '#ffffff',
    color: isDark ? '#f8fafc' : '#1c1917',
    confirmButtonColor: '#f97316',
    cancelButtonColor: isDark ? '#33403b' : '#78716c',
  }
}

async function getSwal() {
  const { default: Swal } = await import('sweetalert2')
  return Swal
}

export async function confirmAlert(options) {
  const Swal = await getSwal()
  const result = await Swal.fire({
    icon: 'warning',
    showCancelButton: true,
    reverseButtons: true,
    focusCancel: true,
    cancelButtonText: 'Batal',
    ...getAlertTheme(),
    ...options,
  })
  return result.isConfirmed
}

export async function successAlert(options) {
  const Swal = await getSwal()
  return Swal.fire({
    icon: 'success',
    timer: 1600,
    timerProgressBar: true,
    showConfirmButton: false,
    ...getAlertTheme(),
    ...options,
  })
}

export async function errorAlert(options) {
  const Swal = await getSwal()
  return Swal.fire({
    icon: 'error',
    confirmButtonText: 'Mengerti',
    ...getAlertTheme(),
    ...options,
  })
}

export async function toastAlert(options) {
  const Swal = await getSwal()
  return Swal.fire({
    toast: true,
    position: 'top-end',
    timer: 1800,
    timerProgressBar: true,
    showConfirmButton: false,
    icon: 'success',
    ...getAlertTheme(),
    ...options,
  })
}
