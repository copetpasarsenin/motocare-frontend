import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  Pencil,
  PlusCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  Wrench,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import EmptyState from '../components/ui/EmptyState'
import StatusBadge from '../components/ui/StatusBadge'
import { deleteService, getCategories, getServices } from '../services/services'
import { buildServicesCsv, downloadCsv, formatCurrency, getCategoryName } from '../utils/csv'
import { downloadServicesExcel } from '../utils/excel'

const CSV_FILENAME = 'motocare_services.csv'
const EXCEL_FILENAME = 'motocare_services.xlsx'

function ServicesList() {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, total_pages: 0 })
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    status: '',
    sort_by: 'name',
    sort_order: 'asc',
    page: 1,
    limit: 10,
  })
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const exportFilters = useMemo(() => ({ ...filters, page: 1, limit: 100 }), [filters])
  const totalPages = Math.max(meta.total_pages, 1)

  const loadServices = async () => {
    setLoading(true)
    setFeedback({ type: '', message: '' })

    try {
      const payload = await getServices(filters)
      setServices(payload.data)
      setMeta(payload.meta)
    } catch (error) {
      setServices([])
      setFeedback({ type: 'error', message: error.message || 'Gagal mengambil data layanan' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategories(await getCategories())
      } catch {
        setCategories([])
      }
    }

    loadCategories()
  }, [])

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === 'page' ? value : 1,
    }))
  }

  const handleExportCsv = async () => {
    setFeedback({ type: '', message: '' })

    try {
      const payload = await getServices(exportFilters)
      if (payload.data.length === 0) {
        setFeedback({ type: 'error', message: 'Tidak ada data layanan untuk diexport.' })
        return
      }

      downloadCsv(CSV_FILENAME, buildServicesCsv(payload.data))
      setFeedback({ type: 'success', message: `Berhasil export ${payload.data.length} layanan ke ${CSV_FILENAME}.` })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Gagal menyiapkan export CSV' })
    }
  }

  const handleExportExcel = async () => {
    setFeedback({ type: '', message: '' })

    try {
      const payload = await getServices(exportFilters)
      if (payload.data.length === 0) {
        setFeedback({ type: 'error', message: 'Tidak ada data layanan untuk diexport.' })
        return
      }

      downloadServicesExcel(EXCEL_FILENAME, payload.data)
      setFeedback({ type: 'success', message: `Berhasil export ${payload.data.length} layanan ke ${EXCEL_FILENAME}.` })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Gagal menyiapkan export Excel' })
    }
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      category_id: '',
      status: '',
      sort_by: 'name',
      sort_order: 'asc',
      page: 1,
      limit: filters.limit,
    })
  }

  const handleDelete = async (service) => {
    setDeletingId(service.id)
    setFeedback({ type: '', message: '' })

    try {
      await deleteService(service.id)
      const payload = await getServices(filters)
      setServices(payload.data)
      setMeta(payload.meta)
      setFeedback({ type: 'success', message: `Layanan "${service.name}" berhasil dihapus.` })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Gagal menghapus layanan' })
    } finally {
      setDeletingId(null)
      setPendingDelete(null)
    }
  }

  return (
    <section className="card services-card service-catalog-page">
      <div className="section-heading row-heading services-hero-heading">
        <div>
          <p className="eyebrow">MotoCare Services</p>
          <h3>Pilih Layanan</h3>
          <p>Kelola katalog layanan servis, harga, durasi, status, dan export data operasional.</p>
        </div>
        <div className="button-row">
          <Link className="primary-button" to="/services/create"><PlusCircle size={17} />Create Service</Link>
        </div>
      </div>

      <div className="services-controls">
        <div className="services-filter-panel">
          <div className="filter-panel-heading">
            <SlidersHorizontal size={18} />
            <span>Search, filter, and sorting</span>
          </div>
          <div className="toolbar services-toolbar">
            <label className="search-field services-search">
              <Search size={18} />
              <input
                type="search"
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
                placeholder="Cari nama layanan atau deskripsi..."
              />
            </label>
            <label>
              Category
              <select value={filters.category_id} onChange={(event) => updateFilter('category_id', event.target.value)} aria-label="Filter kategori">
                <option value="">Semua kategori</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label>
              Status
              <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} aria-label="Filter status">
                <option value="">Semua status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label>
              Sort by
              <select value={filters.sort_by} onChange={(event) => updateFilter('sort_by', event.target.value)} aria-label="Urutkan berdasarkan">
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="duration_minutes">Duration</option>
                <option value="status">Status</option>
              </select>
            </label>
            <label>
              Order
              <select value={filters.sort_order} onChange={(event) => updateFilter('sort_order', event.target.value)} aria-label="Arah sorting">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </label>
          </div>
        </div>
        <div className="services-export-panel">
          <span>Export current view</span>
          <div className="button-row">
            <button className="ghost-button" type="button" onClick={handleExportCsv}>
              <Download size={17} />
              Export CSV
            </button>
            <button className="ghost-button accent-button" type="button" onClick={handleExportExcel}>
              <FileSpreadsheet size={17} />
              Export Excel-compatible
            </button>
          </div>
        </div>
      </div>

      {feedback.message && <div className={`feedback ${feedback.type}`}>{feedback.message}</div>}

      <div className="table-summary">
        <div>
          <strong>{loading ? 'Memuat layanan...' : `${meta.total} layanan ditemukan`}</strong>
          <span>Page {meta.page} of {totalPages}</span>
        </div>
        <div className="table-summary-actions">
          <button className="ghost-button" type="button" onClick={resetFilters} disabled={loading}>
            Reset Filter
          </button>
          <button className="ghost-button" type="button" onClick={loadServices} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="service-grid-loading">Memuat data layanan...</div>
      ) : (
        <div className="service-card-grid" aria-label="Service catalog">
          {services.map((service, index) => (
            <article className={`service-catalog-card ${index === 0 ? 'featured' : ''}`} key={service.id}>
              <div className="service-card-topline">
                <span className="service-icon-box"><Wrench size={22} aria-hidden="true" /></span>
                <span className="service-code">ID: #{service.id}</span>
              </div>
              <div className="service-card-body">
                <h4>{service.name}</h4>
                <p>{service.description || 'Tanpa deskripsi'}</p>
              </div>
              <div className="service-card-meta">
                <span>{getCategoryName(service)}</span>
                <span>{service.duration_minutes} menit</span>
              </div>
              <div className="service-card-footer">
                <strong>{formatCurrency(service.price)}</strong>
                <StatusBadge status={service.status} />
              </div>
              <div className="service-card-actions table-actions">
                <Link className="action-button detail" to={`/services/${service.id}`}><Eye size={14} />Detail</Link>
                <Link className="action-button edit" to={`/services/${service.id}/edit`}><Pencil size={14} />Edit</Link>
                <button className="action-button delete" type="button" onClick={() => setPendingDelete(service)} disabled={deletingId === service.id}>
                  <Trash2 size={14} />
                  {deletingId === service.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && services.length === 0 && (
        <EmptyState title="Layanan kosong" description="Tidak ada layanan sesuai filter saat ini. Reset filter untuk melihat seluruh katalog." />
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

      {pendingDelete && (
        <div className="modal-backdrop" role="presentation">
          <div className="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-service-title">
            <div className="dialog-icon danger">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 id="delete-service-title">Delete service?</h3>
              <p>
                Layanan <strong>{pendingDelete.name}</strong> akan dihapus dari katalog. Data yang dihapus tidak bisa dikembalikan.
              </p>
            </div>
            <div className="dialog-actions">
              <button className="ghost-button" type="button" onClick={() => setPendingDelete(null)} disabled={Boolean(deletingId)}>
                Cancel
              </button>
              <button className="danger-button" type="button" onClick={() => handleDelete(pendingDelete)} disabled={Boolean(deletingId)}>
                <Trash2 size={16} />
                {deletingId ? 'Deleting...' : 'Delete Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ServicesList
