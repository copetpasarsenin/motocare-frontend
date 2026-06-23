import { CalendarCheck, CircleDollarSign, ClipboardList, Gauge, Timer, Wrench } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getDashboardStats } from '../services/dashboard'
import { formatCurrency } from '../utils/csv'

const statusColors = {
  pending: '#f97316',
  confirmed: '#2563eb',
  in_progress: '#8b5cf6',
  completed: '#16a34a',
  cancelled: '#dc2626',
}

const emptyStats = {
  total_categories: 0,
  total_services: 0,
  total_bookings: 0,
  pending_bookings: 0,
  completed_bookings: 0,
  estimated_revenue: 0,
  bookings_by_status: [],
  top_services: [],
}

function Dashboard() {
  const [stats, setStats] = useState(emptyStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      setError('')

      try {
        setStats(await getDashboardStats())
      } catch (err) {
        setError(err.message || 'Gagal mengambil statistik dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const summaryCards = useMemo(() => [
    { label: 'Total Categories', value: stats.total_categories, icon: ClipboardList, tone: 'blue', meta: 'Service groups' },
    { label: 'Total Services', value: stats.total_services, icon: Wrench, tone: 'orange', meta: 'Garage menu' },
    { label: 'Total Bookings', value: stats.total_bookings, icon: CalendarCheck, tone: 'blue', meta: 'All requests' },
    { label: 'Pending Bookings', value: stats.pending_bookings, icon: Timer, tone: 'orange', meta: 'Needs attention' },
    { label: 'Completed Bookings', value: stats.completed_bookings, icon: Gauge, tone: 'blue', meta: 'Finished work' },
    { label: 'Estimated Revenue', value: formatCurrency(stats.estimated_revenue), icon: CircleDollarSign, tone: 'orange', meta: 'Projected value' },
  ], [stats])

  const tooltipStyle = {
    background: 'var(--dashboard-tooltip-bg)',
    border: '1px solid var(--dashboard-border)',
    borderRadius: 8,
    boxShadow: '0 18px 38px rgba(15, 23, 42, 0.16)',
    color: 'var(--dashboard-text)',
  }

  return (
    <div className="page-grid dashboard-grid">
      <section className="hero-card dashboard-hero-card">
        <div className="dashboard-hero-content">
          <p className="eyebrow">MotoCare Command Center</p>
          <h2>Modern Garage Operations</h2>
          <p>Pantau layanan, booking, status pekerjaan, dan estimasi revenue dari satu dashboard.</p>
          <div className="dashboard-hero-badges" aria-label="Dashboard highlights">
            <span>Live API data</span>
            <span>Service workflow</span>
            <span>Garage analytics</span>
          </div>
        </div>
        <div className="dashboard-hero-panel" aria-label="Operations snapshot">
          <span className="hero-panel-label">Today&apos;s overview</span>
          <strong>{loading ? '...' : stats.total_bookings}</strong>
          <span>Total bookings tracked</span>
          <div>
            <small>{loading ? '...' : stats.pending_bookings} pending</small>
            <small>{loading ? '...' : formatCurrency(stats.estimated_revenue)}</small>
          </div>
        </div>
      </section>

      {error && <div className="feedback error span-2">{error}</div>}

      <section className="stats-grid dashboard-stats-grid">
        {summaryCards.map((item) => {
          const Icon = item.icon
          return (
            <article className={`stat-card dashboard-stat-card ${item.tone}`} key={item.label}>
              <span className={`stat-icon ${item.tone}`}>
                <Icon size={22} />
              </span>
              <div>
                <strong>{loading ? '...' : item.value}</strong>
                <span>{item.label}</span>
                <small>{item.meta}</small>
              </div>
            </article>
          )
        })}
      </section>

      <section className="card chart-card dashboard-chart-card">
        <div className="section-heading dashboard-chart-heading">
          <div>
            <p className="eyebrow">Booking Status</p>
            <h3>Booking Count by Status</h3>
          </div>
          <p>Distribusi booking berdasarkan status proses servis.</p>
        </div>
        {loading ? (
          <div className="chart-placeholder">Memuat chart status booking...</div>
        ) : stats.bookings_by_status.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.bookings_by_status}
                dataKey="total"
                nameKey="status"
                innerRadius={64}
                outerRadius={104}
                paddingAngle={3}
              >
                {stats.bookings_by_status.map((entry) => (
                  <Cell key={entry.status} fill={statusColors[entry.status] || '#64748b'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [value, 'Bookings']}
                contentStyle={tooltipStyle}
                itemStyle={{ color: 'var(--dashboard-text)' }}
                labelStyle={{ color: 'var(--dashboard-muted)' }}
              />
              <Legend formatter={(value) => value.replaceAll('_', ' ')} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-placeholder">Belum ada data booking untuk chart status.</div>
        )}
      </section>

      <section className="card chart-card dashboard-chart-card">
        <div className="section-heading dashboard-chart-heading">
          <div>
            <p className="eyebrow">Service Demand</p>
            <h3>Top Services</h3>
          </div>
          <p>Layanan paling sering dibooking oleh customer.</p>
        </div>
        {loading ? (
          <div className="chart-placeholder">Memuat chart top services...</div>
        ) : stats.top_services.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.top_services} margin={{ top: 8, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--dashboard-chart-grid)" />
              <XAxis
                dataKey="service_name"
                tick={{ fontSize: 12, fill: 'var(--dashboard-chart-muted)' }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={70}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--dashboard-chart-muted)' }} />
              <Tooltip
                formatter={(value) => [value, 'Bookings']}
                contentStyle={tooltipStyle}
                cursor={{ fill: 'var(--dashboard-chart-hover)' }}
                itemStyle={{ color: 'var(--dashboard-text)' }}
                labelStyle={{ color: 'var(--dashboard-muted)' }}
              />
              <Bar dataKey="total_bookings" name="Bookings" radius={[6, 6, 0, 0]} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-placeholder">Belum ada data top services.</div>
        )}
      </section>
    </div>
  )
}

export default Dashboard
