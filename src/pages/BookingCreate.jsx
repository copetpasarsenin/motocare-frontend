import { ArrowLeft, ArrowRight, CheckSquare, Info, User, Wrench } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { createBooking } from '../services/bookings'
import { getServices } from '../services/services'
import { formatCurrency } from '../utils/csv'
import {
  hasBookingValidationErrors,
  toBookingPayload,
  validateBookingForm,
} from '../utils/bookingValidation'

const initialValues = {
  service_id: '',
  customer_name: '',
  phone: '',
  vehicle_name: '',
  vehicle_plate: '',
  booking_date: '',
  notes: '',
}

function FieldError({ message }) {
  if (!message) return null
  return <span className="field-error">{message}</span>
}

const timeOptions = ['09:00 WIB', '10:30 WIB', '13:00 WIB', '14:30 WIB', '16:00 WIB']

const addOns = [
  { id: 'wash', name: 'Cuci Salju', price: 50000 },
  { id: 'nitrogen', name: 'Isi Nitrogen', price: 20000 },
]

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

function BookingCreate() {
  const [values, setValues] = useState(initialValues)
  const [services, setServices] = useState([])
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [selectedTime, setSelectedTime] = useState(timeOptions[1])
  const [selectedAddOns, setSelectedAddOns] = useState([])
  const navigate = useNavigate()
  const dateOptions = useMemo(() => buildDateOptions(), [])
  const selectedService = useMemo(
    () => services.find((service) => String(service.id) === String(values.service_id)),
    [services, values.service_id],
  )
  const addOnTotal = selectedAddOns.reduce((total, addOnId) => {
    const addOn = addOns.find((item) => item.id === addOnId)
    return total + (addOn?.price || 0)
  }, 0)
  const servicePrice = Number(selectedService?.price || 0)
  const estimatedTax = Math.round(servicePrice * 0.11)
  const estimatedTotal = servicePrice + addOnTotal + estimatedTax

  useEffect(() => {
    const loadServices = async () => {
      try {
        const payload = await getServices({ page: 1, limit: 100, status: 'active', sort_by: 'name', sort_order: 'asc' })
        setServices(payload.data)
      } catch (error) {
        setFeedback({ type: 'error', message: error.message || 'Gagal mengambil daftar layanan' })
      }
    }

    loadServices()
  }, [])

  const updateValue = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  const toggleAddOn = (addOnId) => {
    setSelectedAddOns((current) => (
      current.includes(addOnId)
        ? current.filter((item) => item !== addOnId)
        : [...current, addOnId]
    ))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateBookingForm(values)
    setErrors(validationErrors)

    if (hasBookingValidationErrors(validationErrors)) {
      setFeedback({ type: 'error', message: 'Periksa kembali form booking.' })
      return
    }

    setLoading(true)
    setFeedback({ type: '', message: '' })

    try {
      await createBooking(toBookingPayload(values))
      setFeedback({ type: 'success', message: 'Booking berhasil dibuat.' })
      setTimeout(() => navigate('/bookings'), 600)
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
          <p>Buat booking servis dengan alur premium, tetap memakai data layanan dan payload backend yang sudah ada.</p>
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
                <p>Pilih salah satu layanan aktif dari katalog MotoCare.</p>
              </div>
            </div>

            <div className="booking-service-options">
              {services.map((service) => (
                <button
                  className={`booking-service-option ${String(values.service_id) === String(service.id) ? 'selected' : ''}`}
                  key={service.id}
                  type="button"
                  onClick={() => updateValue('service_id', String(service.id))}
                >
                  <span className="service-icon-box"><Wrench size={19} /></span>
                  <span>
                    <strong>{service.name}</strong>
                    <small>{service.description || 'Layanan MotoCare premium.'}</small>
                    <em>Est. {formatCurrency(service.price || 0)}</em>
                  </span>
                  <i>ID: {service.id}</i>
                </button>
              ))}
            </div>
            <FieldError message={errors.service_id} />
          </section>

          <section className="booking-panel">
            <div className="booking-panel-heading">
              <User size={22} />
              <div>
                <h4>Data Pelanggan</h4>
                <p>Informasi ini tetap dikirim dengan payload booking yang sudah ada.</p>
              </div>
            </div>

            <div className="booking-form-grid">
              <label className="figma-field">
                <span>Nama Lengkap</span>
                <input value={values.customer_name} onChange={(event) => updateValue('customer_name', event.target.value)} placeholder="Masukkan nama sesuai STNK" />
                <FieldError message={errors.customer_name} />
              </label>
              <label className="figma-field">
                <span>Nomor HP</span>
                <input value={values.phone} onChange={(event) => updateValue('phone', event.target.value)} placeholder="+62 8xx-xxxx-xxxx" />
                <FieldError message={errors.phone} />
              </label>
              <label className="figma-field">
                <span>Nama Kendaraan</span>
                <input value={values.vehicle_name} onChange={(event) => updateValue('vehicle_name', event.target.value)} placeholder="Honda Beat" />
                <FieldError message={errors.vehicle_name} />
              </label>
              <label className="figma-field">
                <span>Nomor Plat</span>
                <input value={values.vehicle_plate} onChange={(event) => updateValue('vehicle_plate', event.target.value)} placeholder="B 1234 MTC" />
                <FieldError message={errors.vehicle_plate} />
              </label>
              <label className="figma-field full-span">
                <span>Catatan Layanan Lainnya</span>
                <textarea rows="4" value={values.notes} onChange={(event) => updateValue('notes', event.target.value)} placeholder="Masukkan layanan lainnya" />
              </label>
            </div>
          </section>

          <section className="booking-info-card">
            <Info size={23} />
            <div>
              <h4>Informasi Hari Ini</h4>
              <p>Bengkel buka: <strong>08:00 - 20:00</strong> | Kapasitas tersedia: <strong>4 Slot</strong></p>
            </div>
          </section>
        </div>

        <aside className="booking-confirm-panel">
          <h4>Jadwal & Konfirmasi</h4>

          <div className="booking-confirm-group">
            <span>Pilih Tanggal</span>
            <div className="booking-date-grid">
              {dateOptions.map((date) => (
                <button
                  className={values.booking_date === date.value ? 'selected' : ''}
                  key={date.value}
                  type="button"
                  onClick={() => updateValue('booking_date', date.value)}
                >
                  <small>{date.month}</small>
                  <strong>{date.day}</strong>
                  <em>{date.weekday}</em>
                </button>
              ))}
            </div>
            <input className="booking-date-input" type="date" value={values.booking_date} onChange={(event) => updateValue('booking_date', event.target.value)} />
            <FieldError message={errors.booking_date} />
          </div>

          <div className="booking-confirm-group">
            <span>Pilih Waktu</span>
            <div className="booking-time-grid">
              {timeOptions.map((time) => (
                <button className={selectedTime === time ? 'selected' : ''} key={time} type="button" onClick={() => setSelectedTime(time)}>
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="booking-confirm-group">
            <span>Layanan Tambahan</span>
            <div className="booking-addon-list">
              {addOns.map((addOn) => (
                <label key={addOn.id}>
                  <input type="checkbox" checked={selectedAddOns.includes(addOn.id)} onChange={() => toggleAddOn(addOn.id)} />
                  <CheckSquare size={18} />
                  <strong>{addOn.name}</strong>
                  <em>+{formatCurrency(addOn.price)}</em>
                </label>
              ))}
            </div>
          </div>

          <div className="booking-summary">
            <div><span>{selectedService?.name || 'Pilih layanan'}</span><strong>{formatCurrency(servicePrice)}</strong></div>
            <div><span>Layanan tambahan</span><strong>{formatCurrency(addOnTotal)}</strong></div>
            <div><span>Pajak & biaya (11%)</span><strong>{formatCurrency(estimatedTax)}</strong></div>
            <div className="total"><span>Total</span><strong>{formatCurrency(estimatedTotal)}</strong></div>
          </div>

          <button className="primary-button booking-confirm-button" type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Konfirmasi Pemesanan'}
            {!loading && <ArrowRight size={18} />}
          </button>
          <small className="booking-payload-note">Waktu dan tambahan ditampilkan sebagai preferensi UI; payload backend tetap mengikuti format booking saat ini.</small>
        </aside>
      </form>
    </section>
  )
}

export default BookingCreate
