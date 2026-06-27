import {
  CalendarDays,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Mail,
  Phone,
  PlusCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import EmptyState from '../components/ui/EmptyState'
import StatusBadge from '../components/ui/StatusBadge'
import { bookingStatuses, getBookings, updateBookingStatus } from '../services/bookings'
import { getStoredUser } from '../utils/auth'

const SKELETON_ROWS = 5

function formatDate(value) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getServiceName(booking) {
  return booking?.service?.name || '-'
}

function getVehicleInfo(booking) {
  return `${booking.vehicle_name || '-'} / ${booking.vehicle_plate || '-'}`
}

function SkeletonRow({ cols }) {
  return (
    <tr className="skeleton-row" aria-hidden="true">
      {Array.from({ length: cols }, (_, index) => (
        <td key={index}><span className="skeleton-box skeleton-text-md" /></td>
      ))}
    </tr>
  )
}

function BookingsList() {
  const user = getStoredUser()
  const isAdmin = user?.role === 'admin'
  const colCount = isAdmin ? 9 : 7
  const [bookings, setBookings] = useState([])
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, total_pages: 0 })
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
    limit: 10,
  })
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const totalPages = Math.max(meta.total_pages, 1)
  const visibleStatusCounts = bookings.reduce((counts, booking) => {
    counts[booking.status] = (counts[booking.status] || 0) + 1
    return counts
  }, {})

  const loadBookings = async (nextFilters = filters, options = {}) => {
    setLoading(true)
    if (!options.keepFeedback) {
      setFeedback({ type: '', message: '' })
    }

    try {
      const payload = await getBookings(nextFilters)
      setBookings(payload.data)
      setMeta(payload.meta)
    } catch (error) {
      setBookings([])
      setFeedback({
        type: 'error',
        message: !isAdmin && error.status === 403
          ? 'Booking Anda belum dapat ditampilkan. Izin backend untuk riwayat booking user mungkin perlu disesuaikan.'
          : error.message || 'Gagal mengambil data booking',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBookings(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === 'page' ? value : 1,
    }))
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      sort_by: 'created_at',
      sort_order: 'desc',
      page: 1,
      limit: filters.limit,
    })
  }

  const handleStatusChange = async (bookingId, status) => {
    if (!isAdmin) return

    setUpdatingId(bookingId)
    setFeedback({ type: '', message: '' })

    try {
      const updatedBooking = await updateBookingStatus(bookingId, status)
      setBookings((current) => current.map((booking) => (booking.id === bookingId ? updatedBooking : booking)))
      setFeedback({ type: 'success', message: 'Status booking berhasil diubah.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Gagal mengubah status booking' })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <section className="card bookings-card booking-management-page">
      <div className="section-heading row-heading">
        <div>
          <span className="admin-page-eyebrow">Booking Management</span>
          <h3>Bookings</h3>
          <p>{isAdmin ? 'Admin melihat semua booking dan dapat mengubah status.' : 'User melihat booking miliknya sendiri.'}</p>
        </div>
        <Link className="primary-button" to="/bookings/create">
          <PlusCircle size={17} />
          Create Booking
        </Link>
      </div>

      <div className="booking-metrics-grid" aria-label="Booking summary">
        <div className="booking-metric-card">
          <span>Total Bookings</span>
          <strong>{meta.total}</strong>
        </div>
        <div className="booking-metric-card">
          <span>Visible Pending</span>
          <strong>{visibleStatusCounts.pending || 0}</strong>
        </div>
        <div className="booking-metric-card">
          <span>Visible In Progress</span>
          <strong>{visibleStatusCounts.in_progress || 0}</strong>
        </div>
        <div className="booking-metric-card">
          <span>Visible Completed</span>
          <strong>{visibleStatusCounts.completed || 0}</strong>
        </div>
      </div>

      <div className="bookings-controls">
        <div className="filter-panel-heading">
          <SlidersHorizontal size={18} />
          <span>Search and filter bookings</span>
        </div>
        <div className="toolbar booking-toolbar">
          <label className="search-field booking-search">
            <Search size={18} />
            <input
              type="search"
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
              placeholder="Cari customer, phone, motor, plat..."
            />
          </label>
          <label>
            Status
            <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} aria-label="Filter status booking">
              <option value="">Semua status</option>
              {bookingStatuses.map((status) => (
                <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>
              ))}
            </select>
          </label>
          <label>
            Sort by
            <select value={filters.sort_by} onChange={(event) => updateFilter('sort_by', event.target.value)} aria-label="Sort bookings by">
              <option value="created_at">Created date</option>
              <option value="booking_date">Booking date</option>
              <option value="status">Status</option>
            </select>
          </label>
          <label>
            Order
            <select value={filters.sort_order} onChange={(event) => updateFilter('sort_order', event.target.value)} aria-label="Sort booking order">
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </label>
        </div>
      </div>

      {feedback.message && <div className={`feedback ${feedback.type}`}>{feedback.message}</div>}

      <div className="table-summary">
        <div>
          <strong>{loading ? 'Memuat booking...' : `${meta.total} booking ditemukan`}</strong>
          <span>Page {meta.page} of {totalPages}</span>
        </div>
        <div className="table-summary-actions">
          <button className="ghost-button" type="button" onClick={resetFilters} disabled={loading}>
            Reset Filter
          </button>
          <button className="ghost-button" type="button" onClick={() => loadBookings(filters)} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="table-scroll">
        <table className="data-table bookings-table">
          <thead>
            <tr>
              <th>ID</th>
              {isAdmin && <th>User</th>}
              <th>Customer</th>
              <th>Phone</th>
              <th>Vehicle</th>
              <th>Service</th>
              <th>Date</th>
              <th>Status</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <SkeletonRow key={index} cols={colCount} />
            ))}
            {!loading && bookings.map((booking) => (
              <tr key={booking.id}>
                <td data-label="ID"><span className="booking-id">#{booking.id}</span></td>
                {isAdmin && (
                  <td data-label="User">
                    <span className="booking-cell-main"><Mail size={14} />{booking.user?.email || '-'}</span>
                  </td>
                )}
                <td data-label="Customer">
                  <span className="booking-cell-main"><User size={14} />{booking.customer_name}</span>
                </td>
                <td data-label="Phone">
                  <span className="booking-cell-main"><Phone size={14} />{booking.phone}</span>
                </td>
                <td data-label="Vehicle">
                  <span className="booking-cell-main"><Car size={14} />{getVehicleInfo(booking)}</span>
                </td>
                <td data-label="Service">
                  <span className="booking-service-name">{getServiceName(booking)}</span>
                </td>
                <td data-label="Date">
                  <span className="booking-cell-main"><CalendarDays size={14} />{formatDate(booking.booking_date)}</span>
                </td>
                <td data-label="Status"><StatusBadge status={booking.status} /></td>
                {isAdmin && (
                  <td data-label="Actions">
                    <select
                      className="inline-select"
                      value={booking.status}
                      onChange={(event) => handleStatusChange(booking.id, event.target.value)}
                      disabled={updatingId === booking.id}
                      aria-label={`Update status booking ${booking.id}`}
                    >
                      {bookingStatuses.map((status) => (
                        <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>
                      ))}
                    </select>
                    {updatingId === booking.id && <span className="status-updating"><Clock3 size={13} />Updating</span>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && bookings.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="Booking kosong"
          description="Tidak ada booking sesuai filter saat ini. Reset filter atau buat booking baru."
          actionLabel="Buat Booking"
          actionTo="/bookings/create"
        />
      )}

      <div className="pagination">
        <button className="ghost-button" type="button" disabled={filters.page <= 1 || loading} onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}>
          <ChevronLeft size={16} />
          Previous
        </button>
        <div className="pagination-current">
          <span>Page</span>
          <strong>{meta.page} / {totalPages}</strong>
        </div>
        <button className="ghost-button" type="button" disabled={filters.page >= totalPages || loading} onClick={() => updateFilter('page', filters.page + 1)}>
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  )
}

export default BookingsList
