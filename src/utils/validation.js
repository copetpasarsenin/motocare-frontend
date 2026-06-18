const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email) {
  const value = email.trim()
  if (!value) return 'Email wajib diisi'
  if (!emailPattern.test(value)) return 'Format email tidak valid'
  return ''
}

export function validatePassword(password) {
  if (!password) return 'Password wajib diisi'
  if (password.length < 6) return 'Password minimal 6 karakter'
  return ''
}

export function validateUsername(username) {
  if (!username.trim()) return 'Username wajib diisi'
  return ''
}

export function firstValidationError(errors) {
  return Object.values(errors).find(Boolean) || ''
}
