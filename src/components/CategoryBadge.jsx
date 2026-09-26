// src/components/CategoryBadge.jsx
import { TIPOS_CONFIG, COLOR_MAP } from '../data/mockDocuments';

export default function CategoryBadge({ tipoDocumento, area, size = 'md' }) {
  const config = TIPOS_CONFIG[tipoDocumento];
  const colors = COLOR_MAP[config?.color] || { bg: 'var(--blue-soft, #eaf0fe)', text: 'var(--blue, #2f5fdb)' };
  const label = config?.label || tipoDocumento || area || 'Documento';
  const icon = config?.icon || 'bi-file-earmark-text';

  return (
    <span
      className={`badge-soft ${size === 'lg' ? 'fs-6 px-3 py-2' : ''}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <i className={`bi ${icon}`} />
      {label}
    </span>
  );
}