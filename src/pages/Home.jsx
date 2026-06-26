import { ArrowRight, CheckCircle2, Clock3, Gauge, ShieldCheck, Wrench } from 'lucide-react'
import { Link } from 'react-router'

const featuredServices = [
  {
    title: 'Servis Rutin',
    description: 'Pemeriksaan berkala untuk menjaga performa motor tetap stabil setiap hari.',
    duration: '45 Menit',
    price: 'Mulai Rp 65.000',
    icon: Wrench,
  },
  {
    title: 'Ganti Oli & Filter',
    description: 'Perawatan fluida mesin dengan oli berkualitas untuk umur mesin lebih panjang.',
    duration: '30 Menit',
    price: 'Mulai Rp 85.000',
    icon: Gauge,
  },
  {
    title: 'Diagnostik Motor',
    description: 'Pengecekan kelistrikan dan kondisi mesin memakai standar teknisi MotoCare.',
    duration: '60 Menit',
    price: 'Mulai Rp 120.000',
    icon: ShieldCheck,
  },
]

const benefits = [
  'Teknisi berpengalaman untuk motor harian dan premium.',
  'Proses servis rapi dengan catatan pekerjaan yang mudah dipantau.',
  'Layanan booking digital untuk mengurangi waktu tunggu di bengkel.',
]

function Home() {
  return (
    <main className="public-home">
      <header className="public-home-nav">
        <Link className="public-brand" to="/home">MOTOCARE</Link>
        <nav aria-label="MotoCare public navigation">
          <Link className="active" to="/home">Home</Link>
          <Link to="/services">Services</Link>
          <Link className="nav-cta" to="/login">Booking Service</Link>
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
          <p>Pilih layanan populer MotoCare atau masuk ke dashboard untuk melihat katalog lengkap dari API.</p>
        </div>
        <div className="public-service-grid">
          {featuredServices.map((service) => {
            const Icon = service.icon
            return (
              <article className="public-service-card" key={service.title}>
                <span className="service-icon-box"><Icon size={20} /></span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <footer>
                  <span><Clock3 size={14} />{service.duration}</span>
                  <strong>{service.price}</strong>
                </footer>
              </article>
            )
          })}
        </div>
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
          <span>(c) 2024 MOTOCARE PRECISION ENGINEERING. ALL RIGHTS RESERVED.</span>
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
