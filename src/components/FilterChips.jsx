import { AREAS, AREA_CONFIG } from '../data/mockDocuments';

export default function FilterChips({ documentos, activeFilter, onChange }) {
  const countFor = (filterKey) => {
    if (filterKey === 'Todos') return documentos.length;
    if (filterKey === 'Fallidos') return documentos.filter((d) => d.estado === 'Fallido').length;
    return documentos.filter((d) => d.area === filterKey).length;
  };

  const chips = ['Todos', ...AREAS, 'Fallidos'];

  return (
    <div className="d-flex flex-wrap gap-2 mb-3">
      {chips.map((chip) => {
        const isActive = activeFilter === chip;
        const icon = chip === 'Todos' ? 'bi-grid' : chip === 'Fallidos' ? 'bi-x-circle' : AREA_CONFIG[chip].icon;
        return (
          <button
            key={chip}
            type="button"
            className={`filter-chip ${isActive ? 'active' : ''}`}
            onClick={() => onChange(chip)}
          >
            <i className={`bi ${icon}`} />
            {chip}
            <span className="count">{countFor(chip)}</span>
          </button>
        );
      })}
    </div>
  );
}
