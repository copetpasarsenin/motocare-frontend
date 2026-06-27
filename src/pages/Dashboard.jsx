import { Activity, CalendarCheck, CircleDollarSign, ClipboardList, Gauge, Loader2, Timer, Wrench } from 'lucide-react'
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

function ChartLoading({ label }) {
  return (
    <div className="chart-placeholder chart-loading">
      <Loader2 size={28} className="spin" />
      <span>{label}</span>
    </div>
  )
}

function PiePercentLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 1.45
  const posX = cx + radius * Math.cos(-midAngle * RADIAN)
  const posY = cy + radius * Math.sin(-midAngle * RADIAN)
  if (percent < 0.03) return null
  return (
    <text x={posX} y={posY} fill="var(--dashboard-text, #f8fafc)" fontSize={12} fontWeight={700} textAnchor={posX > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  )
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

  const bayStatus = [
    { bay: 'B1', label: 'Active Jobs', value: stats.pending_bookings, status: 'In Progress', tone: 'active' },
    { bay: 'B2', label: 'Completed', value: stats.completed_bookings, status: 'Ready', tone: 'ready' },
    { bay: 'B3', label: 'Available Slots', value: Math.max(stats.total_services - stats.pending_bookings, 0), status: 'Standby', tone: 'idle' },
  ]

  const activityItems = [
    { label: 'Booking pipeline', value: `${stats.total_bookings} total requests`, meta: `${stats.pending_bookings} pending review` },
    { label: 'Service catalog', value: `${stats.total_services} active services`, meta: `${stats.total_categories} categories managed` },
    { label: 'Revenue monitor', value: formatCurrency(stats.estimated_revenue), meta: 'Projected dashboard value' },
  ]

  return (
    <div className="page-grid dashboard-grid home-dashboard">
      <section className="hero-card dashboard-hero-card">
        <div className="dashboard-hero-copy">
          <span className="garage-tag">Admin Console</span>
          <p className="eyebrow">MotoCare Command Center</p>
          <h2>Operations Dashboard</h2>
          <p>Pantau performa bengkel, katalog servis, booking, dan estimasi revenue dalam satu workspace admin.</p>
          <div className="dashboard-hero-badges" aria-label="Dashboard highlights">
            <button type="button" onClick={() => document.getElementById('section-stats')?.scrollIntoView({ behavior: 'smooth' })}>Live API Data</button>
            <button type="button" onClick={() => document.getElementById('section-booking-chart')?.scrollIntoView({ behavior: 'smooth' })}>Booking Overview</button>
            <button type="button" onClick={() => document.getElementById('section-analytics')?.scrollIntoView({ behavior: 'smooth' })}>Garage Analytics</button>
          </div>
        </div>
        <div className="dashboard-hero-panel" aria-label="Operations snapshot">
          <span className="hero-panel-label">Admin Overview</span>
          <strong>{loading ? '...' : stats.total_bookings}</strong>
          <span>Total bookings tracked</span>
          <div>
            <small>{loading ? '...' : stats.pending_bookings} pending jobs</small>
            <small>{loading ? '...' : formatCurrency(stats.estimated_revenue)}</small>
          </div>
        </div>
      </section>

      {error && <div className="feedback error span-2">{error}</div>}

      <section className="stats-grid dashboard-stats-grid" id="section-stats">
        {summaryCards.map((item) => {
          const Icon = item.icon
          return (
            <article className={`stat-card dashboard-stat-card ${item.tone} ${loading ? 'skeleton-pulse' : ''}`} key={item.label}>
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

      <section className="card chart-card dashboard-chart-card" id="section-booking-chart">
        <div className="section-heading dashboard-chart-heading">
          <div>
            <p className="eyebrow">Booking Status</p>
            <h3>Booking Count by Status</h3>
          </div>
          <p>Distribusi booking berdasarkan status proses servis.</p>
        </div>
        {loading ? (
          <ChartLoading label="Memuat chart status booking..." />
        ) : stats.bookings_by_status.length > 0 ? (
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={stats.bookings_by_status}
                dataKey="total"
                nameKey="status"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                label={PiePercentLabel}
                labelLine={false}
              >
                {stats.bookings_by_status.map((entry) => (
                  <Cell key={entry.status} fill={statusColors[entry.status] || '#64748b'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => {
                  const pct = (props.percent * 100).toFixed(1)
                  return [`${value} (${pct}%)`, 'Bookings']
                }}
                contentStyle={tooltipStyle}
                itemStyle={{ color: 'var(--dashboard-text)' }}
                labelStyle={{ color: 'var(--dashboard-muted)' }}
              />
              <Legend
                formatter={(value) => value.replaceAll('_', ' ')}
                iconType="circle"
                wrapperStyle={{ paddingTop: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-placeholder">Belum ada data booking untuk chart status.</div>
        )}
      </section>

      <section className="card chart-card dashboard-chart-card" id="section-analytics">
        <div className="section-heading dashboard-chart-heading">
          <div>
            <p className="eyebrow">Service Demand</p>
            <h3>Top Services</h3>
          </div>
          <p>Layanan paling sering dibooking oleh customer.</p>
        </div>
        {loading ? (
          <ChartLoading label="Memuat chart top services..." />
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
              <Bar dataKey="total_bookings" name="Bookings" radius={[6, 6, 0, 0]} fill="#ff7000" barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-placeholder">Belum ada data top services.</div>
        )}
      </section>

      <section className="dashboard-ops-card" aria-label="Booking overview">
        <div className="dashboard-ops-heading">
          <div>
            <p className="eyebrow">Workshop Bays</p>
            <h3>Booking Overview</h3>
          </div>
          <span>{loading ? 'Syncing' : 'Live'}</span>
        </div>
        <div className="dashboard-bay-list">
          {bayStatus.map((bay) => (
            <article className={`dashboard-bay-item ${bay.tone}`} key={bay.bay}>
              <strong>{bay.bay}</strong>
              <div>
                <span>{bay.label}</span>
                <small>{loading ? '...' : bay.value}</small>
              </div>
              <em>{bay.status}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-activity-card" aria-label="Recent activity">
        <div className="dashboard-ops-heading">
          <div>
            <p className="eyebrow">Recent Activity</p>
            <h3>Booking Overview</h3>
          </div>
          <Activity size={20} />
        </div>
        <div className="dashboard-activity-list">
          {activityItems.map((item) => (
            <article key={item.label}>
              <div>
                <strong>{item.label}</strong>
                <span>{loading ? 'Loading dashboard data...' : item.meta}</span>
              </div>
              <em>{loading ? '...' : item.value}</em>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Dashboard


