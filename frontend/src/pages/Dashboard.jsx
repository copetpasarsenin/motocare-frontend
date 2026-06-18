import { CalendarCheck, CircleDollarSign, ClipboardList, Timer, Wrench } from 'lucide-react'
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
    { label: 'Total Categories', value: stats.total_categories, icon: ClipboardList, tone: 'blue' },
    { label: 'Total Services', value: stats.total_services, icon: Wrench, tone: 'orange' },
    { label: 'Total Bookings', value: stats.total_bookings, icon: CalendarCheck, tone: 'blue' },
    { label: 'Pending Bookings', value: stats.pending_bookings, icon: Timer, tone: 'orange' },
    { label: 'Completed Bookings', value: stats.completed_bookings, icon: CalendarCheck, tone: 'blue' },
    { label: 'Estimated Revenue', value: formatCurrency(stats.estimated_revenue), icon: CircleDollarSign, tone: 'orange' },
  ], [stats])

  return (
    <div className="page-grid dashboard-grid">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Workshop Control</p>
          <h2>Modern Garage Operations</h2>
          <p className="muted">Pantau layanan, booking, status pekerjaan, dan estimasi revenue dari satu dashboard.</p>
        </div>
      </section>

      {error && <div className="feedback error span-2">{error}</div>}

      <section className="stats-grid dashboard-stats-grid">
        {summaryCards.map((item) => {
          const Icon = item.icon
          return (
            <article className="stat-card" key={item.label}>
              <span className={`stat-icon ${item.tone}`}>
                <Icon size={22} />
              </span>
              <div>
                <strong>{loading ? '...' : item.value}</strong>
                <span>{item.label}</span>
              </div>
            </article>
          )
        })}
      </section>

      <section className="card chart-card">
        <div className="section-heading">
          <h3>Booking Count by Status</h3>
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
              <Tooltip formatter={(value) => [value, 'Bookings']} />
              <Legend formatter={(value) => value.replaceAll('_', ' ')} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-placeholder">Belum ada data booking untuk chart status.</div>
        )}
      </section>

      <section className="card chart-card">
        <div className="section-heading">
          <h3>Top Services</h3>
          <p>Layanan paling sering dibooking oleh customer.</p>
        </div>
        {loading ? (
          <div className="chart-placeholder">Memuat chart top services...</div>
        ) : stats.top_services.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.top_services} margin={{ top: 8, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5eaf2" />
              <XAxis
                dataKey="service_name"
                tick={{ fontSize: 12, fill: '#667085' }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={70}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#667085' }} />
              <Tooltip formatter={(value) => [value, 'Bookings']} />
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
