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
