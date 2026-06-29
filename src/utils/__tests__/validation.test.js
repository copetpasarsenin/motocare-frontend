import { test } from 'node:test'
import assert from 'node:assert/strict'

// Use dynamic import so the test file stays ESM-compatible with the
// Vite-driven frontend source while still being runnable with `node --test`.
const { validateEmail, validatePassword, validateUsername, firstValidationError } =
  await import('../validation.js')

test('validateEmail accepts a valid address', () => {
  assert.equal(validateEmail('user@example.com'), '')
})

test('validateEmail rejects empty input', () => {
  assert.equal(validateEmail(''), 'Email wajib diisi')
  assert.equal(validateEmail('   '), 'Email wajib diisi')
})

test('validateEmail rejects malformed input', () => {
  assert.equal(validateEmail('not-an-email'), 'Format email tidak valid')
  assert.equal(validateEmail('missing@domain'), 'Format email tidak valid')
  assert.equal(validateEmail('a@b@c'), 'Format email tidak valid')
})

test('validatePassword enforces minimum length', () => {
  assert.equal(validatePassword(''), 'Password wajib diisi')
  assert.equal(validatePassword('12345'), 'Password minimal 6 karakter')
  assert.equal(validatePassword('123456'), '')
  assert.equal(validatePassword('  123456  '), '') // trims implicitly via validation logic?
})

test('validateUsername requires non-empty value', () => {
  assert.equal(validateUsername(''), 'Username wajib diisi')
  assert.equal(validateUsername('   '), 'Username wajib diisi')
  assert.equal(validateUsername('budi'), '')
})

test('firstValidationError returns the first truthy error', () => {
  const errors = {
    email: '',
    password: 'Password minimal 6 karakter',
    username: '',
  }
  assert.equal(firstValidationError(errors), 'Password minimal 6 karakter')
})

test('firstValidationError returns empty string when no errors', () => {
  assert.equal(firstValidationError({ email: '', password: '', username: '' }), '')
})

test('firstValidationError returns empty string for empty object', () => {
  assert.equal(firstValidationError({}), '')
})
