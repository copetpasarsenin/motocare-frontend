import { apiClient } from './api'

export const defaultServiceMeta = { page: 1, limit: 10, total: 0, total_pages: 0 }

export function normalizeServiceList(payload) {
  return {
    data: Array.isArray(payload?.data) ? payload.data : [],
    meta: payload?.meta || defaultServiceMeta,
  }
}

export async function getServices(params = {}, options = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return normalizeServiceList(await apiClient(`/api/services${suffix}`, options))
}

export async function getPublicServices(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return normalizeServiceList(await apiClient(`/api/public/services${suffix}`, {
    includeAuth: false,
    redirectOnUnauthorized: false,
  }))
}

export async function getServiceById(id) {
  const payload = await apiClient(`/api/services/${id}`)
  return payload?.data
}

export async function getPublicServiceById(id) {
  const payload = await apiClient(`/api/public/services/${id}`, {
    includeAuth: false,
    redirectOnUnauthorized: false,
  })
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

export const OTHER_CATEGORY_NAME = 'Kategori Lainnya'

export async function createCategory(data) {
  const payload = await apiClient('/api/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return payload?.data
}

export async function getOrCreateOtherCategory() {
  const categories = await getCategories()
  const existing = categories.find((category) => category?.name?.trim().toLowerCase() === OTHER_CATEGORY_NAME.toLowerCase())
  if (existing) return { categories, otherCategory: existing }

  const otherCategory = await createCategory({ name: OTHER_CATEGORY_NAME, description: 'Kategori layanan tambahan MotoCare' })
  return { categories: [...categories, otherCategory], otherCategory }
}
