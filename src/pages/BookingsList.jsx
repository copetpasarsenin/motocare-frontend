import {
  CalendarDays,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Mail,
  Phone,
  PlusCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  User,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import EmptyState from '../components/ui/EmptyState'
import StatusBadge from '../components/ui/StatusBadge'
import { bookingStatuses, getBookings, updateBooking, updateBookingStatus } from '../services/bookings'
import { getUserRole } from '../utils/auth'
import { getServices } from '../services/services'
import { formatCurrency } from '../utils/csv'

const SKELETON_ROWS = 5

function formatDate(value) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  return String(value).slice(0, 5)
}

function toDateInputValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function toTimeInputValue(value) {
  if (!value) return '09:00'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '09:00'
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function toBookingDateTime(date, time) {
  return `${date}T${time}:00+07:00`
}
function isFinalStatus(status) {
  return ['completed', 'cancelled', 'rejected'].includes(status)
}

function canUserEditBooking(booking) {
  const bookingDate = new Date(booking.booking_date)
  return !isFinalStatus(booking.status) && !Number.isNaN(bookingDate.getTime()) && bookingDate.getTime() - Date.now() > 60 * 60 * 1000
}

function canUserCancelBooking(booking) {
  return !isFinalStatus(booking.status) && ['pending', 'confirmed'].includes(booking.status)
}

function getServiceName(booking) {
  return booking?.service?.name || '-'
}

function getServiceCategory(booking) {
  return booking?.service?.category?.name || booking?.service?.category_name || '-'
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
  const isAdmin = getUserRole() === 'admin'
  const colCount = isAdmin ? 9 : 8
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
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [editingBooking, setEditingBooking] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [services, setServices] = useState([])
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


  useEffect(() => {
    if (isAdmin) return
    getServices({ page: 1, limit: 100, status: 'active', sort_by: 'name', sort_order: 'asc' })
      .then((payload) => setServices(payload.data))
      .catch(() => setServices([]))
  }, [isAdmin])

  const openEditBooking = (booking) => {
    setEditingBooking(booking)
    setEditValues({
      service_id: String(booking.service_id || booking.service?.id || ''),
      customer_name: booking.customer_name || '',
      phone: booking.phone || '',
      vehicle_name: booking.vehicle_name || '',
      vehicle_plate: booking.vehicle_plate || '',
      booking_date: toDateInputValue(booking.booking_date),
      booking_time: toTimeInputValue(booking.booking_date),
      notes: booking.notes || '',
    })
  }

  const handleUserCancel = async (booking) => {
    if (!canUserCancelBooking(booking)) return
    setUpdatingId(booking.id)
    setFeedback({ type: '', message: '' })
    try {
      const updatedBooking = await updateBooking(booking.id, { status: 'cancelled' })
      setBookings((current) => current.map((item) => (item.id === booking.id ? updatedBooking : item)))
      setFeedback({ type: 'success', message: 'Booking berhasil dibatalkan.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Gagal membatalkan booking' })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editingBooking) return
    setUpdatingId(editingBooking.id)
    setFeedback({ type: '', message: '' })
    try {
      const updatedBooking = await updateBooking(editingBooking.id, {
        service_id: Number(editValues.service_id),
        customer_name: editValues.customer_name,
        phone: editValues.phone,
        vehicle_name: editValues.vehicle_name,
        vehicle_plate: editValues.vehicle_plate,
        booking_date: toBookingDateTime(editValues.booking_date, editValues.booking_time),
        notes: editValues.notes,
      })
      setBookings((current) => current.map((item) => (item.id === editingBooking.id ? updatedBooking : item)))
      setEditingBooking(null)
      setFeedback({ type: 'success', message: 'Booking berhasil diedit.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Gagal mengedit booking' })
    } finally {
      setUpdatingId(null)
    }
  }
  const handleStatusChange = async (bookingId, status) => {
    if (!isAdmin) return

    setUpdatingId(bookingId)
    setFeedback({ type: '', message: '' })

    try {
      const updatedBooking = await updateBookingStatus(bookingId, status)
      setBookings((current) => current.map((booking) => (booking.id === bookingId ? updatedBooking : booking)))
      setFeedback({ type: 'success', message: 'Status booking berhasil diubah.' })
      setSelectedBooking((current) => (current?.id === updatedBooking.id ? updatedBooking : current))
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
        {!isAdmin && (
          <Link className="primary-button" to="/bookings/create">
            <PlusCircle size={17} />
            Create Booking
          </Link>
        )}
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
              <th>Actions</th>
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
                <td data-label="Actions">
                  <div className="booking-row-actions table-actions">
                    <button className="action-button detail" type="button" onClick={() => setSelectedBooking(booking)}>
                      <Eye size={14} />
                      Detail
                    </button>
                    {!isAdmin && canUserEditBooking(booking) && (
                      <button className="action-button" type="button" onClick={() => openEditBooking(booking)} disabled={updatingId === booking.id}>Edit</button>
                    )}
                    {!isAdmin && canUserCancelBooking(booking) && (
                      <button className="action-button danger" type="button" onClick={() => handleUserCancel(booking)} disabled={updatingId === booking.id}>Batal</button>
                    )}
                    {isAdmin && (
                      <div className="booking-status-action">
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
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && bookings.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="Booking kosong"
          description="Tidak ada booking sesuai filter saat ini. Reset filter untuk melihat data booking lain."
          actionLabel={!isAdmin ? 'Buat Booking' : undefined}
          actionTo={!isAdmin ? '/bookings/create' : undefined}
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


      {editingBooking && (
        <div className="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setEditingBooking(null) }}>
          <form className="booking-detail-dialog booking-edit-dialog" onSubmit={handleEditSubmit} role="dialog" aria-modal="true" aria-labelledby="booking-edit-title">
            <div className="booking-detail-header">
              <div><span>Edit Booking</span><h3 id="booking-edit-title">Booking #{editingBooking.id}</h3></div>
              <button className="icon-button" type="button" onClick={() => setEditingBooking(null)} aria-label="Tutup edit booking"><X size={18} /></button>
            </div>
            <div className="booking-edit-grid">
              <label><span>Layanan</span><select value={editValues.service_id} onChange={(event) => setEditValues((current) => ({ ...current, service_id: event.target.value }))} required>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label>
              <label><span>Tanggal</span><input type="date" value={editValues.booking_date} onChange={(event) => setEditValues((current) => ({ ...current, booking_date: event.target.value }))} required /></label>
              <label><span>Waktu</span><input type="time" min="09:00" max="17:00" value={editValues.booking_time} onChange={(event) => setEditValues((current) => ({ ...current, booking_time: event.target.value }))} required /><small>Waktu jam kerja kami dimulai dari jam 09.00 sampai jam 17.00.</small></label>
              <label><span>Nama</span><input value={editValues.customer_name} onChange={(event) => setEditValues((current) => ({ ...current, customer_name: event.target.value }))} required /></label>
              <label><span>Nomor HP</span><input value={editValues.phone} onChange={(event) => setEditValues((current) => ({ ...current, phone: event.target.value }))} required /></label>
              <label><span>Kendaraan</span><input value={editValues.vehicle_name} onChange={(event) => setEditValues((current) => ({ ...current, vehicle_name: event.target.value }))} required /></label>
              <label><span>Nomor Plat</span><input value={editValues.vehicle_plate} onChange={(event) => setEditValues((current) => ({ ...current, vehicle_plate: event.target.value }))} required /></label>
              <label className="full-span"><span>Catatan</span><textarea rows="3" value={editValues.notes} onChange={(event) => setEditValues((current) => ({ ...current, notes: event.target.value }))} /></label>
            </div>
            <button className="primary-button booking-confirm-button" type="submit" disabled={updatingId === editingBooking.id}>Simpan Perubahan</button>
          </form>
        </div>
      )}
      {selectedBooking && (
        <div className="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSelectedBooking(null) }}>
          <div className="booking-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="booking-detail-title">
            <div className="booking-detail-header">
              <div>
                <span>Detail Booking</span>
                <h3 id="booking-detail-title">Booking #{selectedBooking.id}</h3>
              </div>
              <button className="icon-button" type="button" onClick={() => setSelectedBooking(null)} aria-label="Tutup detail booking">
                <X size={18} />
              </button>
            </div>

            <div className="booking-detail-status-row">
              <StatusBadge status={selectedBooking.status} />
              <span><CalendarDays size={15} />{formatDate(selectedBooking.booking_date)} · {formatTime(selectedBooking.booking_time)}</span>
            </div>

            <dl className="booking-detail-grid">
              {isAdmin && (
                <div>
                  <dt>User</dt>
                  <dd>{selectedBooking.user?.email || '-'}</dd>
                </div>
              )}
              <div>
                <dt>Customer</dt>
                <dd>{selectedBooking.customer_name || '-'}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{selectedBooking.phone || '-'}</dd>
              </div>
              <div>
                <dt>Vehicle</dt>
                <dd>{getVehicleInfo(selectedBooking)}</dd>
              </div>
              <div>
                <dt>Service</dt>
                <dd>{getServiceName(selectedBooking)}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{getServiceCategory(selectedBooking)}</dd>
              </div>
              <div>
                <dt>Estimasi Harga</dt>
                <dd>{formatCurrency(selectedBooking.service?.price || selectedBooking.price || selectedBooking.total_price)}</dd>
              </div>
              <div>
                <dt>Catatan</dt>
                <dd>{selectedBooking.notes || selectedBooking.note || '-'}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </section>
  )
}

export default BookingsList





