export function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

export function getCategoryName(service) {
  return service?.category?.name || '-'
}

function escapeCsvCell(value) {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

export function buildServicesCsv(services) {
  const headers = ['ID', 'Name', 'Category', 'Price', 'Duration', 'Status', 'Description']
  const rows = services.map((service) => [
    service.id,
    service.name,
    getCategoryName(service),
    service.price,
    service.duration_minutes,
    service.status,
    service.description,
  ])

  return [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function formatDateTimePart(value, options) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', options).format(date)
}

export function getBookingServiceName(booking) {
  return booking?.service?.name || booking?.service_name || '-'
}

export function getBookingCustomerName(booking) {
  return booking?.customer_name || booking?.user?.username || booking?.user?.email || '-'
}

export function getBookingTotalPrice(booking) {
  return booking?.total_price || booking?.price || booking?.service?.price || 0
}

export function buildBookingsCsv(bookings) {
  const headers = ['ID', 'User/Customer', 'Email', 'Service', 'Tanggal Booking', 'Waktu Booking', 'Status', 'Total Harga', 'Tanggal Dibuat']
  const rows = bookings.map((booking) => [
    booking.id,
    getBookingCustomerName(booking),
    booking.user?.email || '',
    getBookingServiceName(booking),
    formatDateTimePart(booking.booking_date, { day: '2-digit', month: 'long', year: 'numeric' }),
    formatDateTimePart(booking.booking_date, { hour: '2-digit', minute: '2-digit', hour12: false }),
    booking.status || '',
    getBookingTotalPrice(booking),
    formatDateTimePart(booking.created_at, { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }),
  ])

  return [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')
}
