export function validateBookingForm(values) {
  const errors = {}

  if (!values.service_id) errors.service_id = 'Layanan wajib dipilih'
  if (!values.customer_name.trim()) errors.customer_name = 'Nama customer wajib diisi'
  if (!values.phone.trim()) errors.phone = 'Nomor telepon wajib diisi'
  if (!values.vehicle_name.trim()) errors.vehicle_name = 'Nama kendaraan wajib diisi'
  if (!values.vehicle_plate.trim()) errors.vehicle_plate = 'Nomor plat wajib diisi'
  if (!values.booking_date) errors.booking_date = 'Tanggal booking wajib diisi'

  return errors
}

export function hasBookingValidationErrors(errors) {
  return Object.values(errors).some(Boolean)
}

export function toBookingPayload(values) {
  return {
    service_id: Number(values.service_id),
    customer_name: values.customer_name.trim(),
    phone: values.phone.trim(),
    vehicle_name: values.vehicle_name.trim(),
    vehicle_plate: values.vehicle_plate.trim().toUpperCase(),
    booking_date: values.booking_date,
    notes: values.notes.trim(),
  }
}
