function StatusBadge({ status = 'pending' }) {
  return <span className={`status-badge ${status}`}>{status.replaceAll('_', ' ')}</span>
}

export default StatusBadge
