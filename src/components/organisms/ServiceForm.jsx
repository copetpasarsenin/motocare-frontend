import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router'

function FieldError({ message }) {
  if (!message) return null
  return <span className="field-error">{message}</span>
}

function ServiceForm({
  values,
  categories,
  errors = {},
  loading = false,
  submitLabel = 'Save',
  cancelTo = '/services',
  cancelLabel = 'Cancel',
  onChange,
  onSubmit,
}) {
  return (
    <form className="stacked-form service-form" onSubmit={onSubmit} noValidate>
      <label className="service-form-field full-span">
        <span>Name</span>
        <input
          value={values.name}
          onChange={(event) => onChange('name', event.target.value)}
          placeholder="Ganti Oli Mesin"
        />
        <FieldError message={errors.name} />
      </label>

      <label className="service-form-field split-field">
        <span>Category</span>
        <select value={values.category_id} onChange={(event) => onChange('category_id', event.target.value)}>
          <option value="">Pilih kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <FieldError message={errors.category_id} />
      </label>

      <label className="service-form-field split-field">
        <span>Status</span>
        <select value={values.status} onChange={(event) => onChange('status', event.target.value)}>
          <option value="">Pilih status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <FieldError message={errors.status} />
      </label>

      <label className="service-form-field split-field">
        <span>Price</span>
        <input
          type="number"
          min="0"
          value={values.price}
          onChange={(event) => onChange('price', event.target.value)}
          placeholder="65000"
        />
        <FieldError message={errors.price} />
      </label>

      <label className="service-form-field split-field">
        <span>Duration</span>
        <input
          type="number"
          min="0"
          value={values.duration_minutes}
          onChange={(event) => onChange('duration_minutes', event.target.value)}
          placeholder="30"
        />
        <FieldError message={errors.duration_minutes} />
      </label>

      <label className="service-form-field full-span">
        <span>Description</span>
        <textarea
          rows="4"
          value={values.description}
          onChange={(event) => onChange('description', event.target.value)}
          placeholder="Deskripsi layanan"
        />
      </label>

      <div className="form-actions">
        <Link className="ghost-button" to={cancelTo}>
          <ArrowLeft size={16} />
          {cancelLabel}
        </Link>
        <button className="primary-button form-submit" type="submit" disabled={loading}>
          <CheckCircle2 size={16} />
          {loading ? 'Menyimpan...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ServiceForm
