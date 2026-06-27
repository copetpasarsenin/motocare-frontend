import { useState } from 'react'
import { Globe, KeyRound, Mail, Shield, User, UserCircle } from 'lucide-react'
import { changePassword, getApiBaseUrl } from '../services/api'
import { getStoredUser } from '../utils/auth'

const initialPasswordValues = { current_password: '', new_password: '', confirm_password: '' }

function Profile() {
  const user = getStoredUser()
  const initials = (user?.username || 'U').slice(0, 2).toUpperCase()
  const roleBadgeClass = user?.role === 'admin' ? 'profile-role-badge admin' : 'profile-role-badge'
  const [passwordValues, setPasswordValues] = useState(initialPasswordValues)
  const [passwordFeedback, setPasswordFeedback] = useState({ type: '', message: '' })
  const [submittingPassword, setSubmittingPassword] = useState(false)

  const updatePasswordValue = (key, value) => {
    setPasswordValues((current) => ({ ...current, [key]: value }))
    setPasswordFeedback({ type: '', message: '' })
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    const hasEmptyField = Object.values(passwordValues).some((value) => !value.trim())
    if (hasEmptyField) {
      setPasswordFeedback({ type: 'error', message: 'Semua field password wajib diisi.' })
      return
    }
    if (passwordValues.new_password !== passwordValues.confirm_password) {
      setPasswordFeedback({ type: 'error', message: 'Password baru dan konfirmasi password harus sama.' })
      return
    }

    setSubmittingPassword(true)
    try {
      await changePassword({ current_password: passwordValues.current_password, new_password: passwordValues.new_password })
      setPasswordValues(initialPasswordValues)
      setPasswordFeedback({ type: 'success', message: 'Password berhasil diubah.' })
    } catch (error) {
      setPasswordFeedback({ type: 'error', message: error.message || 'Gagal mengubah password.' })
    } finally {
      setSubmittingPassword(false)
    }
  }

  return (
    <div className="profile-page">
      <div className="section-heading profile-page-heading">
        <div><p className="eyebrow">MotoCare Account</p><h3>Profile</h3><p>View your account details, role, and connection settings.</p></div>
      </div>

      <section className="profile-hero">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-hero-info"><h2>{user?.username || 'User'}</h2><p>{user?.email || '-'}</p>{user?.role && <span className={roleBadgeClass}>{user.role}</span>}</div>
      </section>

      <section className="profile-section">
        <div className="profile-section-header"><User size={18} /><h3>Account Information</h3></div>
        <dl className="profile-list">
          <div><dt><UserCircle size={15} />Username</dt><dd>{user?.username || '-'}</dd></div>
          <div><dt><Mail size={15} />Email</dt><dd>{user?.email || '-'}</dd></div>
          <div><dt><Shield size={15} />Role</dt><dd><span className={roleBadgeClass}>{user?.role || '-'}</span></dd></div>
        </dl>
      </section>

      <section className="profile-section">
        <div className="profile-section-header"><KeyRound size={18} /><h3>Security</h3></div>
        <dl className="profile-list">
          <div><dt><KeyRound size={15} />Authentication</dt><dd>Bearer Token (JWT)</dd></div>
          <div><dt><Shield size={15} />Session Storage</dt><dd>localStorage</dd></div>
        </dl>
      </section>

      <section className="profile-section">
        <div className="profile-section-header"><KeyRound size={18} /><h3>Ubah Password</h3></div>
        <form className="profile-password-form" onSubmit={handlePasswordSubmit} noValidate>
          <label><span>Password lama</span><input type="password" value={passwordValues.current_password} onChange={(event) => updatePasswordValue('current_password', event.target.value)} placeholder="Masukkan password lama" /></label>
          <label><span>Password baru</span><input type="password" value={passwordValues.new_password} onChange={(event) => updatePasswordValue('new_password', event.target.value)} placeholder="Minimal 6 karakter" /></label>
          <label><span>Konfirmasi password baru</span><input type="password" value={passwordValues.confirm_password} onChange={(event) => updatePasswordValue('confirm_password', event.target.value)} placeholder="Ulangi password baru" /></label>
          {passwordFeedback.message && <div className={`feedback ${passwordFeedback.type}`}>{passwordFeedback.message}</div>}
          <button className="primary-button" type="submit" disabled={submittingPassword}>{submittingPassword ? 'Menyimpan...' : 'Simpan Password'}</button>
        </form>
      </section>

      <section className="profile-section">
        <div className="profile-section-header"><Globe size={18} /><h3>Connection</h3></div>
        <dl className="profile-list"><div><dt><Globe size={15} />API Base URL</dt><dd className="profile-mono">{getApiBaseUrl() || '-'}</dd></div></dl>
      </section>
    </div>
  )
}

export default Profile
