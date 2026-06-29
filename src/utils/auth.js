const TOKEN_KEY = 'motocare_token'
const USER_KEY = 'motocare_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function isTokenExpired(token) {
  if (!token) return true
  const parts = token.split('.')
  if (parts.length !== 3) return true
  try {
    const payload = JSON.parse(atob(parts[1]))
    if (!payload.exp) return false
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

export function isTokenValid() {
  const token = getToken()
  return Boolean(token) && !isTokenExpired(token)
}

export function getStoredUser() {
  const rawUser = localStorage.getItem(USER_KEY)
  if (!rawUser) return null

  try {
    return JSON.parse(rawUser)
  } catch {
    return null
  }
}

export function getCurrentUser() {
  return getStoredUser()
}

export function getUserRole() {
  return getStoredUser()?.role?.toLowerCase() || ''
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated() {
  const token = getToken()
  if (!token) return false
  if (isTokenExpired(token)) {
    clearSession()
    return false
  }
  return true
}
