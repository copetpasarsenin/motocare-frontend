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
  onChange,
  onSubmit,
}) {
  return (
    <form className="stacked-form" onSubmit={onSubmit} noValidate>
      <label>
        Name
        <input
          value={values.name}
          onChange={(event) => onChange('name', event.target.value)}
          placeholder="Ganti Oli Mesin"
        />
        <FieldError message={errors.name} />
      </label>

      <label>
        Category
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

      <label>
        Price
        <input
          type="number"
          min="0"
          value={values.price}
          onChange={(event) => onChange('price', event.target.value)}
          placeholder="65000"
        />
        <FieldError message={errors.price} />
      </label>

      <label>
        Duration
        <input
          type="number"
          min="0"
          value={values.duration_minutes}
          onChange={(event) => onChange('duration_minutes', event.target.value)}
          placeholder="30"
        />
        <FieldError message={errors.duration_minutes} />
      </label>

      <label>
        Status
        <select value={values.status} onChange={(event) => onChange('status', event.target.value)}>
          <option value="">Pilih status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <FieldError message={errors.status} />
      </label>

      <label>
        Description
        <textarea
          rows="4"
          value={values.description}
          onChange={(event) => onChange('description', event.target.value)}
          placeholder="Deskripsi layanan"
        />
      </label>

      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? 'Menyimpan...' : submitLabel}
      </button>
    </form>
  )
}

export default ServiceForm
