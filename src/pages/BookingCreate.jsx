import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { createBooking } from '../services/bookings'
import { getServices } from '../services/services'
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

function BookingCreate() {
  const [values, setValues] = useState(initialValues)
  const [services, setServices] = useState([])
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

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
    <section className="card narrow-card">
      <div className="section-heading row-heading">
        <div>
          <h3>Create Booking</h3>
          <p>Buat booking servis untuk layanan MotoCare yang tersedia.</p>
        </div>
        <Link className="ghost-button" to="/bookings"><ArrowLeft size={16} />Back</Link>
      </div>

      {feedback.message && <div className={`feedback ${feedback.type}`}>{feedback.message}</div>}

      <form className="stacked-form" onSubmit={handleSubmit} noValidate>
        <label>
          Service
          <select value={values.service_id} onChange={(event) => updateValue('service_id', event.target.value)}>
            <option value="">Pilih layanan</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.service_id} />
        </label>

        <label>
          Customer Name
          <input value={values.customer_name} onChange={(event) => updateValue('customer_name', event.target.value)} placeholder="Budi Santoso" />
          <FieldError message={errors.customer_name} />
        </label>

        <label>
          Phone
          <input value={values.phone} onChange={(event) => updateValue('phone', event.target.value)} placeholder="081234560001" />
          <FieldError message={errors.phone} />
        </label>

        <label>
          Vehicle Name
          <input value={values.vehicle_name} onChange={(event) => updateValue('vehicle_name', event.target.value)} placeholder="Honda Beat" />
          <FieldError message={errors.vehicle_name} />
        </label>

        <label>
          Vehicle Plate
          <input value={values.vehicle_plate} onChange={(event) => updateValue('vehicle_plate', event.target.value)} placeholder="B 1234 MTC" />
          <FieldError message={errors.vehicle_plate} />
        </label>

        <label>
          Booking Date
          <input type="date" value={values.booking_date} onChange={(event) => updateValue('booking_date', event.target.value)} />
          <FieldError message={errors.booking_date} />
        </label>

        <label>
          Notes
          <textarea rows="4" value={values.notes} onChange={(event) => updateValue('notes', event.target.value)} placeholder="Catatan tambahan" />
        </label>

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Create Booking'}
        </button>
      </form>
    </section>
  )
}

export default BookingCreate
