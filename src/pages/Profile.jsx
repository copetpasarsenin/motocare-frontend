import { Globe, KeyRound, Mail, Shield, User, UserCircle } from 'lucide-react'
import { getApiBaseUrl } from '../services/api'
import { getStoredUser } from '../utils/auth'

function Profile() {
  const user = getStoredUser()
  const initials = (user?.username || 'U').slice(0, 2).toUpperCase()
  const roleBadgeClass =
    user?.role === 'admin' ? 'profile-role-badge admin' : 'profile-role-badge'

  return (
    <div className="profile-page">
      <div className="section-heading profile-page-heading">
        <div>
          <p className="eyebrow">MotoCare Account</p>
          <h3>Profile</h3>
          <p>View your account details, role, and connection settings.</p>
        </div>
      </div>

      <section className="profile-hero">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-hero-info">
          <h2>{user?.username || 'User'}</h2>
          <p>{user?.email || '-'}</p>
          {user?.role && <span className={roleBadgeClass}>{user.role}</span>}
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section-header">
          <User size={18} />
          <h3>Account Information</h3>
        </div>
        <dl className="profile-list">
          <div>
            <dt>
              <UserCircle size={15} />
              Username
            </dt>
            <dd>{user?.username || '-'}</dd>
          </div>
          <div>
            <dt>
              <Mail size={15} />
              Email
            </dt>
            <dd>{user?.email || '-'}</dd>
          </div>
          <div>
            <dt>
              <Shield size={15} />
              Role
            </dt>
            <dd>
              <span className={roleBadgeClass}>{user?.role || '-'}</span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="profile-section">
        <div className="profile-section-header">
          <KeyRound size={18} />
          <h3>Security</h3>
        </div>
        <dl className="profile-list">
          <div>
            <dt>
              <KeyRound size={15} />
              Authentication
            </dt>
            <dd>Bearer Token (JWT)</dd>
          </div>
          <div>
            <dt>
              <Shield size={15} />
              Session Storage
            </dt>
            <dd>localStorage</dd>
          </div>
        </dl>
      </section>

      <section className="profile-section">
        <div className="profile-section-header">
          <Globe size={18} />
          <h3>Connection</h3>
        </div>
        <dl className="profile-list">
          <div>
            <dt>
              <Globe size={15} />
              API Base URL
            </dt>
            <dd className="profile-mono">{getApiBaseUrl() || '-'}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}

export default Profile
