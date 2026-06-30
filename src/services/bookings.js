import { apiClient } from './api'

export const bookingStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
export const defaultBookingMeta = { page: 1, limit: 10, total: 0, total_pages: 0 }

export function normalizeBookingList(payload) {
  return {
    data: Array.isArray(payload?.data) ? payload.data : [],
    meta: payload?.meta || defaultBookingMeta,
  }
}

export async function getBookings(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return normalizeBookingList(await apiClient(`/api/bookings${suffix}`))
}

export async function getReservedBookingSlots(date) {
  const query = new URLSearchParams({ date })
  const payload = await apiClient(`/api/bookings/reserved-slots?${query.toString()}`)
  return Array.isArray(payload?.data?.reserved_slots) ? payload.data.reserved_slots : []
}

export async function createBooking(data) {
  const payload = await apiClient('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return payload?.data
}

export async function updateBooking(id, data) {
  const payload = await apiClient(`/api/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return payload?.data
}

export async function updateBookingStatus(id, status) {
  const payload = await apiClient(`/api/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
  return payload?.data
}
