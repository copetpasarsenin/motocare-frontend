import { Inbox } from 'lucide-react'
import { Link } from 'react-router'

function EmptyState({
  title = 'Data kosong',
  description = 'Belum ada data untuk ditampilkan.',
  icon: Icon = Inbox,
  actionLabel,
  actionTo,
}) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">
        <Icon size={32} aria-hidden="true" />
      </span>
      <strong>{title}</strong>
      <span>{description}</span>
      {actionLabel && actionTo && (
        <Link className="primary-button empty-state-action" to={actionTo}>
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

export default EmptyState