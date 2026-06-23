import { useState } from 'react'
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'
import { apiClient } from '../services/api'
import { saveSession } from '../utils/auth'
import { firstValidationError, validateEmail, validatePassword } from '../utils/validation'

function Login() {
  const [form, setForm] = useState({ email: 'admin@motocare.test', password: 'password123' })
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const validateForm = () => {
    const errors = {
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
      const response = await apiClient('/login', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      })

      saveSession(response.data.token, response.data.user)
      setFeedback({ type: 'success', message: 'Login berhasil. Mengalihkan ke dashboard...' })
      setTimeout(() => navigate(location.state?.from?.pathname || '/', { replace: true }), 350)
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Login gagal' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-hero" aria-label="MotoCare overview">
        <div className="auth-hero-content">
          <span className="auth-hero-pill">Premium Garage Dashboard</span>
          <h2>MotoCare</h2>
          <p>Manage services, bookings, and garage operations in one dashboard.</p>
          <div className="auth-hero-stats" aria-label="MotoCare highlights">
            <span>Fast booking control</span>
            <span>Service visibility</span>
            <span>Role-aware workspace</span>
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
        <h1>Welcome back</h1>
        <p className="muted">Masuk untuk mengelola layanan servis dan booking bengkel motor.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
                autoComplete="current-password"
              />
            </span>
          </label>
          {feedback.message && <div className={`form-alert ${feedback.type}`}>{feedback.message}</div>}
          <button className="primary-button full" type="submit" disabled={loading}>
            <span>{loading ? 'Memproses...' : 'Login'}</span>
            {!loading && <ArrowRight size={17} aria-hidden="true" />}
          </button>
        </form>

        <div className="auth-note">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>Secure access for MotoCare operations teams.</span>
        </div>

        <p className="auth-switch">
          Belum punya akun? <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  )
}

export default Login
