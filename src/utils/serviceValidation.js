export function validateServiceForm(values) {
  const errors = {}

  if (!values.name.trim()) {
    errors.name = 'Nama layanan wajib diisi'
  }

  if (!values.category_id) {
    errors.category_id = 'Kategori wajib dipilih'
  }

  const price = Number(values.price)
  if (values.price === '' || isNaN(price)) {
    errors.price = 'Harga harus berupa angka yang valid'
  } else if (price < 0) {
    errors.price = 'Harga tidak boleh negatif'
  }

  const duration = Number(values.duration_minutes)
  if (values.duration_minutes === '' || isNaN(duration)) {
    errors.duration_minutes = 'Durasi harus berupa angka yang valid'
  } else if (duration <= 0) {
    errors.duration_minutes = 'Durasi harus lebih dari 0 menit'
  }

  if (!values.status) {
    errors.status = 'Status wajib dipilih'
  }

  return errors
}

export function hasValidationErrors(errors) {
  return Object.values(errors).some(Boolean)
}

export function toServicePayload(values) {
  return {
    category_id: Number(values.category_id),
    name: values.name.trim(),
    description: values.description.trim(),
    price: Number(values.price || 0),
    duration_minutes: Number(values.duration_minutes || 0),
    status: values.status,
  }
}
