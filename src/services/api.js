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
  const token = getToken()
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : null

  if (response.status === 401) {
    redirectToLoginOnUnauthorized()
  }

  if (!response.ok) {
    throw new ApiError(payload?.message || 'Request gagal', response.status, payload)
  }

  return payload
}
