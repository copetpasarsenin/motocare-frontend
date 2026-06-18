import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { apiClient } from '../services/api'
import {
  firstValidationError,
  validateEmail,
  validatePassword,
  validateUsername,
} from '../utils/validation'

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validateForm = () => {
    const errors = {
      username: validateUsername(form.username),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    }

    return firstValidationError(errors)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setFeedback({ type: 'error', message: validationError })
      return
    }

    setLoading(true)
    setFeedback({ type: '', message: '' })

    try {
      await apiClient('/register', {
        method: 'POST',
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      })
      setFeedback({ type: 'success', message: 'Register berhasil. Silakan login.' })
      setTimeout(() => navigate('/login'), 700)
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Register gagal' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">MotoCare Dashboard</p>
        <h1>Register</h1>
        <p className="muted">Buat akun user untuk booking layanan servis motor.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            Username
            <input
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              autoComplete="username"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              autoComplete="new-password"
            />
          </label>
          {feedback.message && <div className={`form-alert ${feedback.type}`}>{feedback.message}</div>}
          <button className="primary-button full" type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          Sudah punya akun? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  )
}

export default Register
