function EmptyState({ title = 'Data kosong', description = 'Belum ada data untuk ditampilkan.' }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  )
}

export default EmptyState
