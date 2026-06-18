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
