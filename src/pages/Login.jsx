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
    <main className="auth-page figma-auth-page">
      <header className="auth-topbar">
        <span className="auth-wordmark">MOTOCARE</span>
        <span className="auth-support">SUPPORT</span>
      </header>

      <section className="auth-stage">
        <div className="auth-hero" aria-label="MotoCare precision motorcycle care" />

        <section className="auth-panel figma-auth-panel">
          <div className="auth-kicker">
            <span />
            <strong>Sign In</strong>
          </div>
          <h1>Masuk Akun</h1>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="auth-line-field">
              <span>Email <Mail size={14} aria-hidden="true" /></span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                autoComplete="email"
                placeholder="john@motocare.id"
              />
            </label>
            <label className="auth-line-field">
              <span>Kata Sandi <LockKeyhole size={14} aria-hidden="true" /></span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                autoComplete="current-password"
                placeholder="********"
              />
            </label>
            {feedback.message && <div className={`form-alert ${feedback.type}`}>{feedback.message}</div>}
            <button className="primary-button full auth-submit" type="submit" disabled={loading}>
              <span>{loading ? 'Memproses...' : 'Masuk Sekarang'}</span>
              {!loading && <ArrowRight size={18} aria-hidden="true" />}
            </button>
          </form>

          <div className="auth-note">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>Secure access for MotoCare operations teams.</span>
          </div>

          <p className="auth-switch">
            Belum punya akun? <Link to="/register">Daftar</Link>
          </p>
        </section>
      </section>

      <footer className="auth-footer">
        <div>
          <strong>MotoCare</strong>
          <span>© 2024 MOTOCARE PRECISION ENGINEERING. ALL RIGHTS RESERVED.</span>
        </div>
        <nav aria-label="Legal links">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Service Status</span>
        </nav>
      </footer>
    </main>
  )
}

export default Login
