import { useState } from 'react'
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react'
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
      <section className="auth-hero" aria-label="MotoCare overview">
        <div className="auth-hero-content">
          <span className="auth-hero-pill">Modern Automotive Admin</span>
          <h2>MotoCare</h2>
          <p>Manage services, bookings, and garage operations in one dashboard.</p>
          <div className="auth-hero-stats" aria-label="MotoCare highlights">
            <span>Cleaner workflows</span>
            <span>Booking readiness</span>
            <span>Garage team access</span>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-brand">
          <span className="auth-logo">MC</span>
          <div>
            <strong>MotoCare</strong>
            <span>Premium Garage Dashboard</span>
          </div>
        </div>
        <p className="eyebrow">MotoCare Dashboard</p>
        <h1>Create account</h1>
        <p className="muted">Buat akun user untuk booking layanan servis motor.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            Username
            <span className="input-shell">
              <UserRound size={17} aria-hidden="true" />
              <input
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                autoComplete="username"
              />
            </span>
          </label>
          <label>
            Email
            <span className="input-shell">
              <Mail size={17} aria-hidden="true" />
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                autoComplete="email"
              />
            </span>
          </label>
          <label>
            Password
            <span className="input-shell">
              <LockKeyhole size={17} aria-hidden="true" />
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                autoComplete="new-password"
              />
            </span>
          </label>
          {feedback.message && <div className={`form-alert ${feedback.type}`}>{feedback.message}</div>}
          <button className="primary-button full" type="submit" disabled={loading}>
            <span>{loading ? 'Memproses...' : 'Register'}</span>
            {!loading && <ArrowRight size={17} aria-hidden="true" />}
          </button>
        </form>

        <div className="auth-note">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>Account creation keeps the existing MotoCare access flow.</span>
        </div>

        <p className="auth-switch">
          Sudah punya akun? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  )
}

export default Register
