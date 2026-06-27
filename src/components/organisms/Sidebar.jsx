import { NavLink } from 'react-router'
import { ChevronRight, Home, LogOut, UserCircle, X } from 'lucide-react'
import { getUserRole } from '../../utils/auth'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: null, roles: ['admin'] },
]

function Sidebar({ open, onClose, onLogout, user, items }) {
  const role = getUserRole()
  const visibleNavItems = items.filter((item) => !item.roles || item.roles.includes(role))

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-mark">MC</div>
        <div>
          <strong>MotoCare</strong>
          <span>Garage Dashboard</span>
        </div>
        <button className="sidebar-close" type="button" onClick={onClose} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <div className="sidebar-user">
        <UserCircle size={19} />
        <div>
          <strong>{user?.username || 'User'}</strong>
          <span>{user?.role || 'guest'}</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <span className="sidebar-nav-label">Workspace</span>
        {visibleNavItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink key={item.to} to={item.to} onClick={onClose} end={item.to === '/dashboard'}>
              <Icon size={18} />
              <span>{item.label}</span>
              <ChevronRight className="nav-chevron" size={16} aria-hidden="true" />
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/home" onClick={onClose}>
          <Home size={18} />
          <span>Home</span>
        </NavLink>
        <button type="button" onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

Sidebar.defaultProps = {
  items: navItems,
}

export default Sidebar

