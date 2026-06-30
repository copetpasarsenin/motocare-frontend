import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { CalendarDays, Gauge, UserCircle, Wrench } from 'lucide-react'
import { clearSession, getStoredUser } from '../../utils/auth'
import { confirmAlert } from '../../utils/alerts'
import { getStoredTheme, toggleTheme } from '../../utils/theme'
import DashboardTopbar from '../organisms/DashboardTopbar'
import Sidebar from '../organisms/Sidebar'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Gauge, roles: ['admin'] },
  { to: '/services', label: 'Services', icon: Wrench },
  { to: '/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/profile', label: 'Profile', icon: UserCircle },
]

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/services': 'Services List',
  '/services/create': 'Create Service',
  '/bookings': 'Bookings',
  '/bookings/create': 'Create Booking',
  '/profile': 'Profile',
}

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(getStoredTheme)
  const user = getStoredUser()
  const navigate = useNavigate()
  const location = useLocation()
  const isDark = theme === 'dark'

  const handleLogout = async () => {
    const confirmed = await confirmAlert({
      title: 'Keluar dari akun?',
      text: 'Sesi login Anda akan diakhiri.',
      confirmButtonText: 'Ya, logout',
    })

    if (!confirmed) return

    clearSession()
    navigate('/login', { replace: true })
  }

  const handleToggleTheme = () => {
    setTheme((currentTheme) => toggleTheme(currentTheme))
  }

  return (
    <div className="dashboard-layout figma-dashboard">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} user={user} items={navItems} />
      {sidebarOpen && <button className="backdrop" type="button" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />}

      <div className="content-shell">
        <DashboardTopbar
          isDark={isDark}
          pageTitle={pageTitles[location.pathname] || 'MotoCare'}
          user={user}
          onLogout={handleLogout}
          onOpenSidebar={() => setSidebarOpen(true)}
          onToggleTheme={handleToggleTheme}
        />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
