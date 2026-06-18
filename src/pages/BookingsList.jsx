import { PlusCircle, RefreshCw, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import EmptyState from '../components/ui/EmptyState'
import StatusBadge from '../components/ui/StatusBadge'
import { bookingStatuses, getBookings, updateBookingStatus } from '../services/bookings'
import { getStoredUser } from '../utils/auth'

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

function BookingsList() {
  const user = getStoredUser()
  const isAdmin = user?.role === 'admin'
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

  const loadBookings = async (options = {}) => {
    setLoading(true)
    if (!options.keepFeedback) {
      setFeedback({ type: '', message: '' })
    }

    try {
      const payload = await getBookings(filters)
      setBookings(payload.data)
      setMeta(payload.meta)
    } catch (error) {
      setBookings([])
      setFeedback({ type: 'error', message: error.message || 'Gagal mengambil data booking' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === 'page' ? value : 1,
    }))
  }

  const handleStatusChange = async (bookingId, status) => {
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
    <section className="card">
      <div className="section-heading row-heading">
        <div>
          <h3>Bookings</h3>
          <p>{isAdmin ? 'Admin melihat semua booking dan dapat mengubah status.' : 'User melihat booking miliknya sendiri.'}</p>
        </div>
        <Link className="primary-button" to="/bookings/create">
          <PlusCircle size={17} />
          Create Booking
        </Link>
      </div>

      <div className="toolbar booking-toolbar">
        <label className="search-field">
          <Search size={18} />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Cari customer, phone, motor, plat..."
          />
        </label>
        <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} aria-label="Filter status booking">
          <option value="">Semua status</option>
          {bookingStatuses.map((status) => (
            <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>
          ))}
        </select>
      </div>

      {feedback.message && <div className={`feedback ${feedback.type}`}>{feedback.message}</div>}

      <div className="table-summary">
        <span>{loading ? 'Memuat booking...' : `${meta.total} booking ditemukan`}</span>
        <button className="ghost-button" type="button" onClick={() => loadBookings()} disabled={loading}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="table-scroll">
        <table className="data-table">
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
            {!loading && bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                {isAdmin && <td>{booking.user?.email || '-'}</td>}
                <td>{booking.customer_name}</td>
                <td>{booking.phone}</td>
                <td>{getVehicleInfo(booking)}</td>
                <td>{getServiceName(booking)}</td>
                <td>{formatDate(booking.booking_date)}</td>
                <td><StatusBadge status={booking.status} /></td>
                {isAdmin && (
                  <td>
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
                  </td>
                )}
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan={isAdmin ? 9 : 7} className="table-loading">Memuat data booking...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && bookings.length === 0 && (
        <EmptyState title="Booking kosong" description="Tidak ada booking sesuai filter saat ini." />
      )}

      <div className="pagination">
        <button className="ghost-button" type="button" disabled={filters.page <= 1 || loading} onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}>
          Previous
        </button>
        <span>Page {meta.page} / {Math.max(meta.total_pages, 1)}</span>
        <button className="ghost-button" type="button" disabled={filters.page >= Math.max(meta.total_pages, 1) || loading} onClick={() => updateFilter('page', filters.page + 1)}>
          Next
        </button>
      </div>
    </section>
  )
}

export default BookingsList
