import { STATUS_CONFIG } from '../data/mockDocuments';

export default function StatusBadge({ estado }) {
  const config = STATUS_CONFIG[estado] || STATUS_CONFIG['En cola'];
  return (
    <span className="status-pill" style={{ backgroundColor: config.bg, color: config.text }}>
      <i className={`bi ${config.icon}`} />
      {estado}
    </span>
  );
}
