import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, Clock3, Moon, Sun, Wrench } from 'lucide-react'
import { Link } from 'react-router'
import { getPublicServices } from '../services/services'
import { formatCurrency, getCategoryName } from '../utils/csv'
import { getStoredTheme, toggleTheme } from '../utils/theme'

const CURRENT_YEAR = new Date().getFullYear()

const benefits = [
  'Teknisi berpengalaman untuk motor harian dan premium.',
  'Proses servis rapi dengan catatan pekerjaan yang mudah dipantau.',
  'Layanan booking digital untuk mengurangi waktu tunggu di bengkel.',
]

function Home() {
  const [theme, setTheme] = useState(getStoredTheme)
  const [services, setServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [servicesError, setServicesError] = useState('')

  const isDark = theme === 'dark'

  function handleToggleTheme() {
    setTheme(toggleTheme(theme))
  }

  useEffect(() => {
    let isMounted = true

    async function loadServices() {
      try {
        setServicesLoading(true)
        setServicesError('')
        const result = await getPublicServices({ page: 1, limit: 100 })
        if (isMounted) {
          setServices(result.data)
        }
      } catch {
        if (isMounted) {
          setServicesError('Katalog layanan belum dapat dimuat. Anda tetap bisa login untuk booking atau coba lagi nanti.')
        }
      } finally {
        if (isMounted) {
          setServicesLoading(false)
        }
      }
    }

    loadServices()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="public-home">
      <header className="public-home-nav">
        <Link className="public-brand" to="/home">MOTOCARE</Link>
        <nav aria-label="MotoCare public navigation">
          <Link className="active" to="/home">Home</Link>
          <Link className="nav-cta" to="/login">Booking Service</Link>
          <button className="public-theme-toggle" type="button" onClick={handleToggleTheme} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>
        </nav>
      </header>

      <section className="public-hero">
        <div className="public-hero-copy">
          <span className="garage-tag">Precision Engineering</span>
          <h1>MotoCare: Performa Maksimal Motor Anda</h1>
          <p>
            Layanan servis motor profesional dengan teknisi berpengalaman, alur booking modern,
            dan pengalaman bengkel premium untuk menjaga kendaraan tetap siap jalan.
          </p>
          <div className="public-hero-actions">
            <Link className="primary-button home-orange-button" to="/login">
              Booking Service Sekarang
              <ArrowRight size={18} />
            </Link>
            <Link className="ghost-button home-outline-button" to="/services">Lihat Layanan</Link>
          </div>
        </div>
        <aside className="public-hero-card" aria-label="MotoCare performance detail">
          <strong>100+</strong>
          <span>Poin Inspeksi Detail</span>
          <small><CheckCircle2 size={14} /> Kalibrasi mesin digital</small>
          <small><CheckCircle2 size={14} /> Optimasi bahan bakar</small>
        </aside>
      </section>

      <section className="public-benefits" aria-label="MotoCare benefits">
        {benefits.map((benefit, index) => (
          <article className={index === 1 ? 'orange' : ''} key={benefit}>
            <p>{benefit}</p>
          </article>
        ))}
      </section>

      <section className="public-service-section">
        <div className="public-section-heading">
          <p className="eyebrow">Official Partner</p>
          <h2>Our Service</h2>
          <p>Pilih layanan aktif MotoCare langsung dari katalog terbaru.</p>
        </div>
        {servicesLoading && <p className="public-service-state">Memuat layanan MotoCare...</p>}
        {!servicesLoading && servicesError && <p className="public-service-state error">{servicesError}</p>}
        {!servicesLoading && !servicesError && services.length === 0 && (
          <p className="public-service-state">Belum ada layanan tersedia.</p>
        )}
        {!servicesLoading && !servicesError && services.length > 0 && (
          <div className="public-service-grid">
            {services.map((service) => (
              <article className="public-service-card" key={service.id}>
                <span className="service-icon-box"><Wrench size={20} /></span>
                <div className="public-service-meta">{getCategoryName(service)}</div>
                <h3>{service.name}</h3>
                <p>{service.description || 'Layanan perawatan motor profesional dari teknisi MotoCare.'}</p>
                <footer>
                  <span><Clock3 size={14} />{service.duration_minutes || 0} menit</span>
                  <strong>{formatCurrency(service.price)}</strong>
                </footer>
                <Link className="public-service-cta" to="/login">Booking Service</Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="public-stats" aria-label="MotoCare statistics">
        <div><strong>5000+</strong><span>Pelanggan Puas</span></div>
        <div><strong>10+</strong><span>Cabang Nasional</span></div>
        <div><strong>50+</strong><span>Teknisi Ahli</span></div>
      </section>

      <section className="public-final-cta">
        <h2>Siap Untuk Performa Maksimal?</h2>
        <Link className="primary-button home-orange-button" to="/login">Booking Service Sekarang</Link>
      </section>

      <footer className="public-footer">
        <div>
          <strong>MotoCare</strong>
          <span>(c) {CURRENT_YEAR} MOTOCARE PRECISION ENGINEERING. ALL RIGHTS RESERVED.</span>
        </div>
        <nav aria-label="Legal links">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Service Status</span>
        </nav>
      </footer>
    </main>
  )
}

export default Home
