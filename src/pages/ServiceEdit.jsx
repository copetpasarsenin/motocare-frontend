import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import ServiceForm from '../components/ui/ServiceForm'
import { getCategories, getServiceById, updateService } from '../services/services'
import { hasValidationErrors, toServicePayload, validateServiceForm } from '../utils/serviceValidation'

const emptyValues = {
  name: '',
  category_id: '',
  price: '0',
  duration_minutes: '0',
  status: 'active',
  description: '',
}

function ServiceEdit() {
  const { id } = useParams()
  const [values, setValues] = useState(emptyValues)
  const [categories, setCategories] = useState([])
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadData = async () => {
      setPageLoading(true)
      setFeedback({ type: '', message: '' })

      try {
        const [categoryData, service] = await Promise.all([getCategories(), getServiceById(id)])
        setCategories(categoryData)
        setValues({
          name: service.name || '',
          category_id: String(service.category_id || ''),
          price: String(service.price ?? 0),
          duration_minutes: String(service.duration_minutes ?? 0),
          status: service.status || 'active',
          description: service.description || '',
        })
      } catch (error) {
        setFeedback({ type: 'error', message: error.message || 'Gagal mengambil data layanan' })
      } finally {
        setPageLoading(false)
      }
    }

    loadData()
  }, [id])

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
      await updateService(id, toServicePayload(values))
      setFeedback({ type: 'success', message: 'Layanan berhasil diubah.' })
      setTimeout(() => navigate(`/services/${id}`), 500)
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Gagal mengubah layanan' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card narrow-card">
      <div className="section-heading row-heading">
        <div>
          <h3>Edit Service #{id}</h3>
          <p>Ubah informasi layanan servis yang sudah tersimpan.</p>
        </div>
        <Link className="ghost-button" to="/services"><ArrowLeft size={16} />Back</Link>
      </div>

      {feedback.message && <div className={`feedback ${feedback.type}`}>{feedback.message}</div>}
      {pageLoading ? (
        <div className="placeholder-box">Memuat form layanan...</div>
      ) : (
        <ServiceForm
          values={values}
          categories={categories}
          errors={errors}
          loading={loading}
          submitLabel="Update Service"
          onChange={updateValue}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  )
}

export default ServiceEdit
