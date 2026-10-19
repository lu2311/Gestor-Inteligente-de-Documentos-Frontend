import { getAreaDistribution, docMatchesArea } from '../data/mockDocuments';

export default function FilterChips({ documentos, activeFilter, onChange }) {
  const countFor = (filterKey) => {
    if (filterKey === 'Todos') return documentos.length;
    if (filterKey === 'Fallidos') return documentos.filter((d) => d.estado === 'Fallido').length;
    return documentos.filter((d) => docMatchesArea(d, filterKey)).length;
  };

  const chips = [
    { key: 'Todos', label: 'Todos', icon: 'bi-grid' },
    ...getAreaDistribution(documentos).map(({ area, label, config }) => ({
      key: area,
      label,
      icon: config.icon,
    })),
    { key: 'Fallidos', label: 'Fallidos', icon: 'bi-x-circle' },
  ];

  return (
    <div className="d-flex flex-wrap gap-2 mb-3">
      {chips.map(({ key, label, icon }) => {
        const isActive = activeFilter === key;
        return (
          <button
            key={key}
            type="button"
            className={`filter-chip ${isActive ? 'active' : ''}`}
            onClick={() => onChange(key)}
          >
            <i className={`bi ${icon}`} />
            {label}
            <span className="count">{countFor(key)}</span>
          </button>
        );
      })}
    </div>
  );
}
