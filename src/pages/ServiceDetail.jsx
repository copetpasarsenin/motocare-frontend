import { ArrowLeft, Edit } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import StatusBadge from '../components/ui/StatusBadge'
import { getServiceById } from '../services/services'
import { formatCurrency, getCategoryName } from '../utils/csv'

function ServiceDetail() {
  const { id } = useParams()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    const loadService = async () => {
      setLoading(true)
      setFeedback('')

      try {
        setService(await getServiceById(id))
      } catch (error) {
        setFeedback(error.message || 'Gagal mengambil detail layanan')
      } finally {
        setLoading(false)
      }
    }

    loadService()
  }, [id])

  return (
    <section className="card narrow-card">
      <div className="section-heading row-heading">
        <div>
          <h3>Service Detail</h3>
          <p>Detail lengkap layanan servis motor.</p>
        </div>
        <div className="button-row">
          <Link className="ghost-button" to="/services"><ArrowLeft size={16} />Back</Link>
          {service && <Link className="primary-button" to={`/services/${service.id}/edit`}><Edit size={16} />Edit</Link>}
        </div>
      </div>

      {loading && <div className="placeholder-box">Memuat detail layanan...</div>}
      {feedback && <div className="feedback error">{feedback}</div>}

      {!loading && service && (
        <dl className="detail-list">
          <div><dt>ID</dt><dd>{service.id}</dd></div>
          <div><dt>Name</dt><dd>{service.name}</dd></div>
          <div><dt>Category</dt><dd>{getCategoryName(service)}</dd></div>
          <div><dt>Price</dt><dd>{formatCurrency(service.price)}</dd></div>
          <div><dt>Duration</dt><dd>{service.duration_minutes} menit</dd></div>
          <div><dt>Status</dt><dd><StatusBadge status={service.status} /></dd></div>
          <div><dt>Description</dt><dd>{service.description || '-'}</dd></div>
        </dl>
      )}
    </section>
  )
}

export default ServiceDetail
