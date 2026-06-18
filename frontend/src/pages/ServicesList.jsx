import { Download, FileSpreadsheet, RefreshCw, Search, Trash2 } from 'lucide-react'
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
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const exportFilters = useMemo(() => ({ ...filters, page: 1, limit: 100 }), [filters])

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

  const handleDelete = async (service) => {
    const confirmed = window.confirm(`Hapus layanan "${service.name}"? Data yang dihapus tidak bisa dikembalikan.`)
    if (!confirmed) return

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
    }
  }

  return (
    <section className="card">
      <div className="section-heading row-heading">
        <div>
          <h3>Services List</h3>
          <p>Daftar layanan servis dengan search, filter, sorting, pagination, CSV, dan Excel export.</p>
        </div>
        <div className="button-row">
          <Link className="ghost-button" to="/services/create">Create</Link>
          <button className="ghost-button" type="button" onClick={handleExportCsv}>
            <Download size={17} />
            Export CSV
          </button>
          <button className="primary-button" type="button" onClick={handleExportExcel}>
            <FileSpreadsheet size={17} />
            Export Excel
          </button>
        </div>
      </div>

      <div className="toolbar services-toolbar">
        <label className="search-field">
          <Search size={18} />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Cari layanan..."
          />
        </label>
        <select value={filters.category_id} onChange={(event) => updateFilter('category_id', event.target.value)} aria-label="Filter kategori">
          <option value="">Semua kategori</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} aria-label="Filter status">
          <option value="">Semua status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={filters.sort_by} onChange={(event) => updateFilter('sort_by', event.target.value)} aria-label="Urutkan berdasarkan">
          <option value="name">Sort: Name</option>
          <option value="price">Sort: Price</option>
          <option value="duration_minutes">Sort: Duration</option>
          <option value="status">Sort: Status</option>
        </select>
        <select value={filters.sort_order} onChange={(event) => updateFilter('sort_order', event.target.value)} aria-label="Arah sorting">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {feedback.message && <div className={`feedback ${feedback.type}`}>{feedback.message}</div>}

      <div className="table-summary">
        <span>{loading ? 'Memuat layanan...' : `${meta.total} layanan ditemukan`}</span>
        <button className="ghost-button" type="button" onClick={loadServices} disabled={loading}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && services.map((service) => (
              <tr key={service.id}>
                <td>{service.id}</td>
                <td>
                  <strong>{service.name}</strong>
                  <small className="table-description">{service.description || 'Tanpa deskripsi'}</small>
                </td>
                <td>{getCategoryName(service)}</td>
                <td>{formatCurrency(service.price)}</td>
                <td>{service.duration_minutes} menit</td>
                <td><StatusBadge status={service.status} /></td>
                <td className="table-actions">
                  <Link to={`/services/${service.id}`}>Detail</Link>
                  <Link to={`/services/${service.id}/edit`}>Edit</Link>
                  <button type="button" onClick={() => handleDelete(service)} disabled={deletingId === service.id}>
                    <Trash2 size={14} />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan="7" className="table-loading">Memuat data layanan...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && services.length === 0 && (
        <EmptyState title="Layanan kosong" description="Tidak ada layanan sesuai filter saat ini." />
      )}

      <div className="pagination">
        <button className="ghost-button" type="button" disabled={filters.page <= 1 || loading} onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}>
          Previous
        </button>
        <span>Page {meta.page} / {Math.max(meta.total_pages, 1)}</span>
        <button className="ghost-button" type="button" disabled={filters.page >= Math.max(meta.total_pages, 1) || loading} onClick={() => updateFilter('page', filters.page + 1)}>
          Next
        </button>
      </div>
    </section>
  )
}

export default ServicesList
