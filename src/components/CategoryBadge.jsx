// src/components/CategoryBadge.jsx
import { TIPOS_CONFIG } from '../data/mockDocuments';

export default function CategoryBadge({ tipoDocumento, size = 'md' }) {
  const config = TIPOS_CONFIG[tipoDocumento] || TIPOS_CONFIG.DECLARACION_JURADA_MENSUAL;
  return (
    <span
      className={`badge-soft ${size === 'lg' ? 'fs-6 px-3 py-2' : ''}`}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      <i className={`bi ${config.icon}`} />
      {config.label}
    </span>
  );
}