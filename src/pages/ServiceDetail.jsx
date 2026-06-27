import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Edit, Gauge, Loader2, ShieldCheck, Tag, Wrench } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import StatusBadge from '../components/ui/StatusBadge'
import { getServiceById } from '../services/services'
import { getUserRole } from '../utils/auth'
import { formatCurrency, getCategoryName } from '../utils/csv'

function ServiceDetail() {
  const isAdmin = getUserRole() === 'admin'
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
    <section className="figma-service-detail">
      <div className="service-detail-actions">
        <Link className="ghost-button home-outline-button" to="/services"><ArrowLeft size={16} />Back to Services</Link>
        {isAdmin && service && <Link className="ghost-button home-outline-button" to={`/services/${service.id}/edit`}><Edit size={16} />Edit</Link>}
      </div>

      {loading && <div className="service-grid-loading"><Loader2 size={24} className="spin" /><span>Memuat detail layanan...</span></div>}
      {feedback && <div className="feedback error">{feedback}</div>}

      {!loading && service && (
        <>
          <section className="figma-service-hero">
            <div className="figma-service-hero-copy">
              <p className="eyebrow">MotoCare Service Detail</p>
              <h3>{service.name}</h3>
              <p>{service.description || 'Layanan servis motor premium dengan teknisi berpengalaman dan standar pengerjaan MotoCare.'}</p>
              <div className="figma-service-cta-row">
                {!isAdmin && (
                  <Link className="primary-button home-orange-button" to={`/bookings/create?service_id=${service.id}`}>
                    Booking Service Sekarang
                    <ArrowRight size={18} />
                  </Link>
                )}
                <StatusBadge status={service.status} />
              </div>
            </div>
            <aside className="figma-service-score">
              <strong>{service.duration_minutes}</strong>
              <span>Menit estimasi</span>
              <small><CheckCircle2 size={14} /> Pemeriksaan sesuai standar</small>
              <small><CheckCircle2 size={14} /> Teknisi MotoCare</small>
            </aside>
          </section>

          <section className="figma-detail-metrics">
            <article>
              <Tag size={22} />
              <span>Category</span>
              <strong>{getCategoryName(service)}</strong>
            </article>
            <article>
              <Gauge size={22} />
              <span>Price</span>
              <strong>{formatCurrency(service.price)}</strong>
            </article>
            <article>
              <Clock size={22} />
              <span>Duration</span>
              <strong>{service.duration_minutes} menit</strong>
            </article>
            <article>
              <Wrench size={22} />
              <span>Service ID</span>
              <strong>#{service.id}</strong>
            </article>
          </section>

          <section className="figma-detail-content">
            <div className="figma-description-card">
              <p className="eyebrow">Description</p>
              <h4>Detail Pengerjaan</h4>
              <p>{service.description || 'Belum ada deskripsi untuk layanan ini.'}</p>
            </div>
            <div className="figma-benefit-grid">
              <article>
                <ShieldCheck size={22} />
                <h5>Official Standard</h5>
                <p>Pengerjaan mengikuti standar teknisi MotoCare untuk menjaga performa motor.</p>
              </article>
              <article>
                <Gauge size={22} />
                <h5>Performance Focus</h5>
                <p>Dirancang untuk membantu kendaraan tetap responsif, aman, dan siap digunakan.</p>
              </article>
              <article>
                <Clock size={22} />
                <h5>Clear Timing</h5>
                <p>Estimasi durasi ditampilkan sejak awal agar jadwal booking lebih mudah diatur.</p>
              </article>
            </div>
          </section>
        </>
      )}
    </section>
  )
}

export default ServiceDetail
