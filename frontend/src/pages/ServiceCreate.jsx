import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import ServiceForm from '../components/ui/ServiceForm'
import { createService, getCategories } from '../services/services'
import { hasValidationErrors, toServicePayload, validateServiceForm } from '../utils/serviceValidation'

const initialValues = {
  name: '',
  category_id: '',
  price: '0',
  duration_minutes: '0',
  status: 'active',
  description: '',
}

function ServiceCreate() {
  const [values, setValues] = useState(initialValues)
  const [categories, setCategories] = useState([])
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategories(await getCategories())
      } catch (error) {
        setFeedback({ type: 'error', message: error.message || 'Gagal mengambil kategori' })
      }
    }

    loadCategories()
  }, [])

  const updateValue = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateServiceForm(values)
    setErrors(validationErrors)

    if (hasValidationErrors(validationErrors)) {
      setFeedback({ type: 'error', message: 'Periksa kembali form layanan.' })
      return
    }

    setLoading(true)
    setFeedback({ type: '', message: '' })

    try {
      const service = await createService(toServicePayload(values))
      setFeedback({ type: 'success', message: 'Layanan berhasil dibuat.' })
      setTimeout(() => navigate(`/services/${service.id}`), 500)
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Gagal membuat layanan' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card narrow-card">
      <div className="section-heading row-heading">
        <div>
          <h3>Create Service</h3>
          <p>Tambahkan layanan servis baru untuk katalog MotoCare.</p>
        </div>
        <Link className="ghost-button" to="/services"><ArrowLeft size={16} />Back</Link>
      </div>

      {feedback.message && <div className={`feedback ${feedback.type}`}>{feedback.message}</div>}

      <ServiceForm
        values={values}
        categories={categories}
        errors={errors}
        loading={loading}
        submitLabel="Create Service"
        onChange={updateValue}
        onSubmit={handleSubmit}
      />
    </section>
  )
}

export default ServiceCreate
