import { ArrowLeft, ArrowRight, Info, User, Wrench } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { createBooking, getReservedBookingSlots } from '../services/bookings'
import { getServices } from '../services/services'
import { getUserRole } from '../utils/auth'
import { validateBookingForm, hasBookingValidationErrors } from '../utils/bookingValidation'
import { formatCurrency } from '../utils/csv'

const initialValues = {
  service_ids: [],
  customer_name: '',
  phone: '',
  vehicle_name: '',
  vehicle_plate: '',
  booking_date: '',
  notes: '',
}

const timeOptions = ['09:00 WIB', '10:30 WIB', '13:00 WIB', '14:30 WIB', '16:00 WIB']

function FieldError({ message }) {
  if (!message) return null
  return <span className="field-error">{message}</span>
}

function toDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildDateOptions() {
  const formatter = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: '2-digit', month: 'short' })
  return Array.from({ length: 4 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)
    const [weekday, dayMonth] = formatter.format(date).split(', ')
    return {
      value: toDateInputValue(date),
      day: dayMonth?.split(' ')[0] || String(date.getDate()).padStart(2, '0'),
      month: dayMonth?.split(' ')[1] || '',
      weekday: weekday || '',
    }
  })
}

function toBookingDateTime(date, timeLabel) {
  const time = timeLabel.replace(' WIB', '')
  return `${date}T${time}:00+07:00`
}

function toTimeValue(timeLabel) {
  return timeLabel.replace(' WIB', '')
}

function toPayload(values, serviceId, selectedTime) {
  return {
    service_id: Number(serviceId),
    customer_name: values.customer_name.trim(),
    phone: values.phone.trim(),
    vehicle_name: values.vehicle_name.trim(),
    vehicle_plate: values.vehicle_plate.trim().toUpperCase(),
    booking_date: toBookingDateTime(values.booking_date, selectedTime),
    notes: values.notes.trim(),
  }
}

function BookingCreate() {
  const [values, setValues] = useState(initialValues)
  const [services, setServices] = useState([])
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [slotLoading, setSlotLoading] = useState(false)
  const [reservedSlots, setReservedSlots] = useState([])
  const [selectedTime, setSelectedTime] = useState(timeOptions[1])
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedServiceId = searchParams.get('service_id') || ''
  const isAdmin = getUserRole() === 'admin'
  const dateOptions = useMemo(() => buildDateOptions(), [])
  const selectedServices = useMemo(
    () => services.filter((service) => values.service_ids.includes(String(service.id))),
    [services, values.service_ids],
  )
  const subtotal = selectedServices.reduce((total, service) => total + Number(service.price || 0), 0)
  const estimatedTax = Math.round(subtotal * 0.11)
  const estimatedTotal = subtotal + estimatedTax
  const reservedSlotSet = useMemo(() => new Set(reservedSlots), [reservedSlots])
  const availableTimes = useMemo(() => timeOptions.filter((time) => !reservedSlotSet.has(toTimeValue(time))), [reservedSlotSet])
  const selectedTimeReserved = reservedSlotSet.has(toTimeValue(selectedTime))

  useEffect(() => {
    if (isAdmin) navigate('/bookings', { replace: true })
  }, [isAdmin, navigate])

  useEffect(() => {
    if (!values.booking_date) {
      setReservedSlots([])
      return
    }

    let cancelled = false
    setSlotLoading(true)

    getReservedBookingSlots(values.booking_date)
      .then((slots) => {
        if (!cancelled) setReservedSlots(slots)
      })
      .catch((error) => {
        if (!cancelled) {
          setReservedSlots([])
          setFeedback({ type: 'error', message: error.message || 'Gagal mengambil slot booking' })
        }
      })
      .finally(() => {
        if (!cancelled) setSlotLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [values.booking_date])

  useEffect(() => {
    if (selectedTimeReserved && availableTimes.length > 0) {
      setSelectedTime(availableTimes[0])
    }
  }, [availableTimes, selectedTimeReserved])

  const updateValue = useCallback((key, value) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }, [])

  const toggleService = (serviceId) => {
    setValues((current) => {
      const id = String(serviceId)
      const exists = current.service_ids.includes(id)
      return { ...current, service_ids: exists ? current.service_ids.filter((item) => item !== id) : [...current.service_ids, id] }
    })
    setErrors((current) => ({ ...current, service_ids: '' }))
  }

  useEffect(() => {
    const loadServices = async () => {
      try {
        const payload = await getServices({ page: 1, limit: 100, status: 'active', sort_by: 'name', sort_order: 'asc' })
        const loadedServices = Array.from(new Map(payload.data.map((service) => [String(service.id || service.name).toLowerCase(), service])).values())
        setServices(loadedServices)

        if (preselectedServiceId && loadedServices.some((service) => String(service.id) === preselectedServiceId)) {
          setValues((current) => (current.service_ids.length ? current : { ...current, service_ids: [preselectedServiceId] }))
        }
      } catch (error) {
        setFeedback({ type: 'error', message: error.message || 'Gagal mengambil daftar layanan' })
      }
    }

    loadServices()
  }, [preselectedServiceId])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateBookingForm(values)
    setErrors(validationErrors)

    if (hasBookingValidationErrors(validationErrors)) {
      setFeedback({ type: 'error', message: 'Periksa kembali form booking.' })
      return
    }

    if (selectedTimeReserved || availableTimes.length === 0) {
      setFeedback({ type: 'error', message: 'Jam booking yang dipilih sudah terisi. Pilih jam lain.' })
      return
    }

    setLoading(true)
    setFeedback({ type: '', message: '' })

    try {
      const results = await Promise.allSettled(
        values.service_ids.map((serviceId) => createBooking(toPayload(values, serviceId, selectedTime))),
      )
      const succeeded = results.filter((result) => result.status === 'fulfilled').length
      const failed = results.length - succeeded

      if (failed === 0) {
        setFeedback({ type: 'success', message: `${succeeded} booking layanan berhasil dibuat.` })
        setTimeout(() => navigate('/bookings'), 600)
      } else if (succeeded === 0) {
        const firstError = results.find((result) => result.status === 'rejected')
        setFeedback({ type: 'error', message: firstError?.reason?.message || 'Gagal membuat semua booking' })
      } else {
        setFeedback({
          type: 'error',
          message: `${succeeded} booking berhasil dibuat, ${failed} gagal. Booking yang berhasil tersimpan di daftar booking Anda.`,
        })
        setTimeout(() => navigate('/bookings'), 2000)
      }
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Gagal membuat booking' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="booking-create-page">
      <div className="booking-page-heading">
        <div>
          <p className="eyebrow">MotoCare Booking</p>
          <h3>Pilih Layanan</h3>
          <p>Buat booking servis dengan satu atau beberapa layanan aktif MotoCare.</p>
        </div>
        <Link className="ghost-button home-outline-button" to="/bookings"><ArrowLeft size={16} />Back</Link>
      </div>

      {feedback.message && <div className={`feedback ${feedback.type}`}>{feedback.message}</div>}

      <form className="booking-layout" onSubmit={handleSubmit} noValidate>
        <div className="booking-main-column">
          <section className="booking-panel">
            <div className="booking-panel-heading">
              <Wrench size={22} />
              <div>
                <h4>Pilih Layanan</h4>
                <p>Pilih satu atau lebih layanan. Layanan yang sama tidak bisa dipilih dua kali.</p>
              </div>
            </div>

            <div className="booking-service-options">
              {services.map((service) => {
                const selected = values.service_ids.includes(String(service.id))
                return (
                  <button className={`booking-service-option ${selected ? 'selected' : ''}`} key={service.id} type="button" onClick={() => toggleService(service.id)} aria-pressed={selected}>
                    <span className="service-icon-box"><Wrench size={19} /></span>
                    <span>
                      <strong>{service.name}</strong>
                      <small>{service.description || 'Layanan MotoCare premium.'}</small>
                      <em>Est. {formatCurrency(service.price || 0)}</em>
                    </span>
                    <i>{selected ? 'Dipilih' : `ID: ${service.id}`}</i>
                  </button>
                )
              })}
            </div>
            <FieldError message={errors.service_ids} />
          </section>

          <section className="booking-panel">
            <div className="booking-panel-heading">
              <User size={22} />
              <div>
                <h4>Data Pelanggan</h4>
                <p>Informasi ini akan dipakai untuk setiap layanan yang dipilih.</p>
              </div>
            </div>

            <div className="booking-form-grid">
              <label className="figma-field"><span>Nama Lengkap</span><input value={values.customer_name} onChange={(event) => updateValue('customer_name', event.target.value)} placeholder="Masukkan nama sesuai STNK" /><FieldError message={errors.customer_name} /></label>
              <label className="figma-field"><span>Nomor HP</span><input value={values.phone} onChange={(event) => updateValue('phone', event.target.value)} placeholder="+62 8xx-xxxx-xxxx" /><FieldError message={errors.phone} /></label>
              <label className="figma-field"><span>Nama Kendaraan</span><input value={values.vehicle_name} onChange={(event) => updateValue('vehicle_name', event.target.value)} placeholder="Honda Beat" /><FieldError message={errors.vehicle_name} /></label>
              <label className="figma-field"><span>Nomor Plat</span><input value={values.vehicle_plate} onChange={(event) => updateValue('vehicle_plate', event.target.value)} placeholder="B 1234 MTC" /><FieldError message={errors.vehicle_plate} /></label>
              <label className="figma-field full-span"><span>Catatan Layanan Lainnya</span><textarea rows="4" value={values.notes} onChange={(event) => updateValue('notes', event.target.value)} placeholder="Masukkan catatan tambahan" /></label>
            </div>
          </section>

          <section className="booking-info-card">
            <Info size={23} />
            <div>
              <h4>Informasi Hari Ini</h4>
              <p>Jam operasional: <strong>09:00 - 17:00</strong> | <strong>Pilih tanggal dan waktu booking sesuai kebutuhan.</strong></p>
              <ul className="booking-info-list">
                <li>Booking bisa dihapus atau dibatalkan oleh user jika status masih memungkinkan.</li>
                <li>Booking bisa diedit maksimal 1 jam sebelum jadwal pelayanan.</li>
              </ul>
            </div>
          </section>
        </div>

        <aside className="booking-confirm-panel">
          <h4>Jadwal & Konfirmasi</h4>
          <div className="booking-confirm-group">
            <span>Pilih Tanggal</span>
            <div className="booking-date-grid">
              {dateOptions.map((date) => <button className={values.booking_date === date.value ? 'selected' : ''} key={date.value} type="button" onClick={() => updateValue('booking_date', date.value)}><small>{date.month}</small><strong>{date.day}</strong><em>{date.weekday}</em></button>)}
            </div>
            <input className="booking-date-input" type="date" value={values.booking_date} onChange={(event) => updateValue('booking_date', event.target.value)} />
            <FieldError message={errors.booking_date} />
          </div>

          <div className="booking-confirm-group">
            <span>Pilih Waktu</span>
            <div className="booking-time-grid">
              {timeOptions.map((time) => {
                const reserved = reservedSlotSet.has(toTimeValue(time))
                return (
                  <button className={`${selectedTime === time ? 'selected' : ''} ${reserved ? 'is-reserved' : ''}`} key={time} type="button" disabled={reserved || slotLoading} onClick={() => setSelectedTime(time)}>
                    <span>{time}</span>
                    {reserved && <small>Penuh</small>}
                  </button>
                )
              })}
            </div>
            <p className="booking-time-note">{slotLoading ? 'Memeriksa slot tersedia...' : 'Waktu jam kerja kami dimulai dari jam 09.00 sampai jam 17.00.'}</p>
          </div>

          <div className="booking-summary">
            {selectedServices.length === 0 && <div><span>Pilih layanan</span><strong>{formatCurrency(0)}</strong></div>}
            {selectedServices.map((service) => <div key={service.id}><span>{service.name}</span><strong>{formatCurrency(service.price || 0)}</strong></div>)}
            <div><span>Pajak & biaya (11%)</span><strong>{formatCurrency(estimatedTax)}</strong></div>
            <div className="total"><span>Total</span><strong>{formatCurrency(estimatedTotal)}</strong></div>
          </div>

          <button className="primary-button booking-confirm-button" type="submit" disabled={loading || slotLoading || selectedTimeReserved || availableTimes.length === 0}>{loading ? 'Menyimpan...' : 'Konfirmasi Pemesanan'}{!loading && <ArrowRight size={18} />}</button>
          <small className="booking-payload-note">Setiap layanan yang dipilih dibuat sebagai booking terpisah agar tetap mengikuti struktur backend saat ini.</small>
        </aside>
      </form>
    </section>
  )
}

export default BookingCreate
