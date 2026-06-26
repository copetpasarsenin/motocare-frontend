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
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validateForm = () => {
    const errors = {
      username: validateUsername(form.username),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword: form.confirmPassword !== form.password ? 'Konfirmasi password tidak sama' : '',
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
            <strong>New Account</strong>
          </div>
          <h1>Buat Akun Baru</h1>

          <form className="auth-form register-auth-form" onSubmit={handleSubmit} noValidate>
            <label className="auth-line-field">
              <span>Nama Lengkap <UserRound size={14} aria-hidden="true" /></span>
              <input
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                autoComplete="username"
                placeholder="John Doe"
              />
            </label>
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
            <div className="auth-password-grid">
              <label className="auth-line-field">
                <span>Kata Sandi <LockKeyhole size={14} aria-hidden="true" /></span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  autoComplete="new-password"
                  placeholder="********"
                />
              </label>
              <label className="auth-line-field">
                <span>Konfirmasi <LockKeyhole size={14} aria-hidden="true" /></span>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  autoComplete="new-password"
                  placeholder="********"
                />
              </label>
            </div>
            {feedback.message && <div className={`form-alert ${feedback.type}`}>{feedback.message}</div>}
            <button className="primary-button full auth-submit" type="submit" disabled={loading}>
              <span>{loading ? 'Memproses...' : 'Daftar Sekarang'}</span>
              {!loading && <ArrowRight size={18} aria-hidden="true" />}
            </button>
          </form>

          <div className="auth-note">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>Account creation keeps the existing MotoCare access flow.</span>
          </div>

          <p className="auth-switch">
            Sudah punya akun? <Link to="/login">Masuk</Link>
          </p>
        </section>
      </section>

      <footer className="auth-footer">
        <div>
          <strong>MotoCare</strong>
          <span>(c) 2024 MOTOCARE PRECISION ENGINEERING. ALL RIGHTS RESERVED.</span>
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

export default Register
