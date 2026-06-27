import { LogOut, Menu, Moon, Sun } from 'lucide-react'

function DashboardTopbar({ isDark, pageTitle, user, onLogout, onOpenSidebar, onToggleTheme }) {
  return (
    <header className="topbar">
      <div className="topbar-heading">
        <button className="icon-button mobile-menu" type="button" onClick={onOpenSidebar} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div>
          <p className="topbar-kicker">MotoCare Dashboard</p>
          <h1>{pageTitle}</h1>
        </div>
      </div>
      <div className="topbar-actions">
        <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
          <span>{isDark ? 'Light' : 'Dark'}</span>
        </button>
        <div className="user-chip">
          <span>{user?.username || 'User'}</span>
          <small>{user?.role || 'guest'}</small>
        </div>
        <button className="ghost-button" type="button" onClick={onLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  )
}

export default DashboardTopbar
