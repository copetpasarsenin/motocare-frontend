import * as XLSX from 'xlsx'
import { getCategoryName } from './csv'

export function buildServicesExcelRows(services) {
  return services.map((service) => ({
    ID: service.id,
    Name: service.name || '',
    Category: getCategoryName(service),
    Price: Number(service.price || 0),
    Duration: Number(service.duration_minutes || 0),
    Status: service.status || '',
    Description: service.description || '',
  }))
}

export function downloadServicesExcel(filename, services) {
  const worksheet = XLSX.utils.json_to_sheet(buildServicesExcelRows(services), {
    header: ['ID', 'Name', 'Category', 'Price', 'Duration', 'Status', 'Description'],
  })

  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 28 },
    { wch: 24 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 48 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Services')
  XLSX.writeFile(workbook, filename)
}

function formatBookingDateTime(value, options) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', options).format(date)
}

export function buildBookingsExcelRows(bookings) {
  return bookings.map((booking) => ({
    ID: booking.id,
    'User/Customer': booking.customer_name || booking.user?.username || booking.user?.email || '-',
    Email: booking.user?.email || '',
    Service: booking.service?.name || booking.service_name || '-',
    'Tanggal Booking': formatBookingDateTime(booking.booking_date, { day: '2-digit', month: 'long', year: 'numeric' }),
    'Waktu Booking': formatBookingDateTime(booking.booking_date, { hour: '2-digit', minute: '2-digit', hour12: false }),
    Status: booking.status || '',
    'Total Harga': Number(booking.total_price || booking.price || booking.service?.price || 0),
    'Tanggal Dibuat': formatBookingDateTime(booking.created_at, { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }),
  }))
}

export function downloadBookingsExcel(filename, bookings) {
  const worksheet = XLSX.utils.json_to_sheet(buildBookingsExcelRows(bookings), {
    header: ['ID', 'User/Customer', 'Email', 'Service', 'Tanggal Booking', 'Waktu Booking', 'Status', 'Total Harga', 'Tanggal Dibuat'],
  })

  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 28 },
    { wch: 28 },
    { wch: 28 },
    { wch: 22 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 24 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings')
  XLSX.writeFile(workbook, filename)
}
