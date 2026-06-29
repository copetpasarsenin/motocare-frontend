import { getCategoryName } from './csv'

const SERVICES_COLUMNS = [
  { header: 'ID', key: 'ID', width: 8 },
  { header: 'Name', key: 'Name', width: 28 },
  { header: 'Category', key: 'Category', width: 24 },
  { header: 'Price', key: 'Price', width: 14 },
  { header: 'Duration', key: 'Duration', width: 12 },
  { header: 'Status', key: 'Status', width: 14 },
  { header: 'Description', key: 'Description', width: 48 },
]

const BOOKINGS_COLUMNS = [
  { header: 'ID', key: 'ID', width: 8 },
  { header: 'User/Customer', key: 'User/Customer', width: 28 },
  { header: 'Email', key: 'Email', width: 28 },
  { header: 'Service', key: 'Service', width: 28 },
  { header: 'Tanggal Booking', key: 'Tanggal Booking', width: 22 },
  { header: 'Waktu Booking', key: 'Waktu Booking', width: 16 },
  { header: 'Status', key: 'Status', width: 16 },
  { header: 'Total Harga', key: 'Total Harga', width: 16 },
  { header: 'Tanggal Dibuat', key: 'Tanggal Dibuat', width: 24 },
]

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

async function loadExcelWriter() {
  const module = await import('write-excel-file/browser')
  return module.default
}

function toExcelColumns(columns) {
  return columns.map((column) => ({
    header: { value: column.header, fontWeight: 'bold' },
    width: column.width,
    cell: (row) => ({ value: row[column.key] ?? '' }),
  }))
}

async function downloadWorkbook(filename, sheetName, columns, rows) {
  const writeExcelFile = await loadExcelWriter()
  await writeExcelFile(rows, {
    columns: toExcelColumns(columns),
    sheet: sheetName,
  }).toFile(filename)
}

export async function downloadServicesExcel(filename, services) {
  await downloadWorkbook(filename, 'Services', SERVICES_COLUMNS, buildServicesExcelRows(services))
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

export async function downloadBookingsExcel(filename, bookings) {
  await downloadWorkbook(filename, 'Bookings', BOOKINGS_COLUMNS, buildBookingsExcelRows(bookings))
}
