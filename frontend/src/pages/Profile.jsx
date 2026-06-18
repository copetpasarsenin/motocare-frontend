import { getApiBaseUrl } from '../services/api'
import { getStoredUser } from '../utils/auth'

function Profile() {
  const user = getStoredUser()

  return (
    <section className="card narrow-card">
      <div className="section-heading">
        <h3>Profile</h3>
        <p>Informasi sesi login yang tersimpan di localStorage.</p>
      </div>
      <dl className="profile-list">
        <div><dt>Username</dt><dd>{user?.username || '-'}</dd></div>
        <div><dt>Email</dt><dd>{user?.email || '-'}</dd></div>
        <div><dt>Role</dt><dd>{user?.role || '-'}</dd></div>
        <div><dt>API Base URL</dt><dd>{getApiBaseUrl()}</dd></div>
      </dl>
    </section>
  )
}

export default Profile
