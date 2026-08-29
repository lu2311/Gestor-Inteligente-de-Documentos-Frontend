import { AREA_CONFIG } from '../data/mockDocuments';

export default function CategoryBadge({ area, size = 'md' }) {
  const config = AREA_CONFIG[area] || AREA_CONFIG.Finanzas;
  return (
    <span
      className={`badge-soft ${size === 'lg' ? 'fs-6 px-3 py-2' : ''}`}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      <i className={`bi ${config.icon}`} />
      {area}
    </span>
  );
}
