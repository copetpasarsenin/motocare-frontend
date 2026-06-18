import { apiClient } from './api'

export const defaultServiceMeta = { page: 1, limit: 10, total: 0, total_pages: 0 }

export function normalizeServiceList(payload) {
  return {
    data: Array.isArray(payload?.data) ? payload.data : [],
    meta: payload?.meta || defaultServiceMeta,
  }
}

export async function getServices(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return normalizeServiceList(await apiClient(`/api/services${suffix}`))
}

export async function getServiceById(id) {
  const payload = await apiClient(`/api/services/${id}`)
  return payload?.data
}

export async function createService(data) {
  const payload = await apiClient('/api/services', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return payload?.data
}

export async function updateService(id, data) {
  const payload = await apiClient(`/api/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return payload?.data
}

export async function deleteService(id) {
  return apiClient(`/api/services/${id}`, {
    method: 'DELETE',
  })
}

export async function getCategories() {
  const payload = await apiClient('/api/categories')
  return Array.isArray(payload?.data) ? payload.data : []
}
