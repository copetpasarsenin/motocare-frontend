import { useState } from 'react'
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'
import { apiClient } from '../services/api'
import { getUserRole, saveSession } from '../utils/auth'
import { firstValidationError, validateEmail, validatePassword } from '../utils/validation'

const CURRENT_YEAR = new Date().getFullYear()

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
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
      const role = getUserRole()
      const fallbackPath = role === 'admin' ? '/dashboard' : '/bookings'
      const fromPath = location.state?.from?.pathname
      const targetPath = fromPath && !['/', '/home', '/login', '/register'].includes(fromPath) ? fromPath : fallbackPath
      setFeedback({ type: 'success', message: 'Login berhasil. Mengalihkan ke halaman akun...' })
      setTimeout(() => navigate(targetPath, { replace: true }), 350)
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Login gagal' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page figma-auth-page">
      <header className="auth-topbar">
        <Link className="auth-wordmark" to="/home">MOTOCARE</Link>
        <Link className="auth-support" to="/home">HOME</Link>
      </header>

      <section className="auth-stage">
        <div className="auth-hero" aria-label="MotoCare precision motorcycle care">
          <div className="auth-hero-copy">
            <span className="garage-tag">Precision Engineering</span>
            <h2>Elevate Your Ride.</h2>
            <p>Bergabunglah dengan ekosistem perawatan motor tercanggih. Pantau performa mesin Anda dengan presisi teknis.</p>
            <div className="auth-hero-lines" aria-hidden="true"><span /><span /><span /></div>
          </div>
        </div>

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
            <span>Akses aman untuk akun MotoCare Anda.</span>
          </div>

          <p className="auth-switch">
            Belum punya akun? <Link to="/register">Daftar</Link>
          </p>
        </section>
      </section>

      <footer className="auth-footer">
        <div>
          <strong>MotoCare</strong>
          <span>(c) {CURRENT_YEAR} MOTOCARE PRECISION ENGINEERING. ALL RIGHTS RESERVED.</span>
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


