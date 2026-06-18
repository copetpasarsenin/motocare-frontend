export function validateServiceForm(values) {
  const errors = {}

  if (!values.name.trim()) {
    errors.name = 'Nama layanan wajib diisi'
  }

  if (!values.category_id) {
    errors.category_id = 'Kategori wajib dipilih'
  }

  if (Number(values.price) < 0) {
    errors.price = 'Harga tidak boleh negatif'
  }

  if (Number(values.duration_minutes) < 0) {
    errors.duration_minutes = 'Durasi tidak boleh negatif'
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
