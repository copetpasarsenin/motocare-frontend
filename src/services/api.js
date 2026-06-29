import { clearSession, getToken } from '../utils/auth'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export const getApiBaseUrl = () => API_BASE_URL

function buildApiUrl(path) {
  if (!API_BASE_URL) {
    throw new ApiError('VITE_API_BASE_URL belum dikonfigurasi', 0, null)
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

function redirectToLoginOnUnauthorized() {
  clearSession()

  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

export async function apiClient(path, options = {}) {
  const { redirectOnUnauthorized = true, includeAuth = true, ...fetchOptions } = options
  const token = includeAuth ? getToken() : ''
  const headers = new Headers(fetchOptions.headers || {})

  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const url = buildApiUrl(path)
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : null

  if (response.status === 401 && redirectOnUnauthorized !== false) {
    redirectToLoginOnUnauthorized()
  }

  if (!response.ok) {
    const error = new ApiError(payload?.message || 'Request gagal', response.status, payload)
    error.url = url
    throw error
  }

  return payload
}

export async function changePassword(data) {
  const payload = await apiClient('/change-password', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return payload?.data
}
