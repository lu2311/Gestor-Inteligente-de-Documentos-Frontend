import CategoryBadge from './CategoryBadge';
import StatusBadge from './StatusBadge';

export default function RecentDocumentsCard({ documentos, onViewHistorial }) {
  const recientes = documentos.slice(0, 4);

  return (
    <div className="card-plain p-3 mb-3">
      <h6 className="fw-bold mb-2">Últimos documentos</h6>
      {recientes.map((doc) => (
        <div className="recent-doc-row" key={doc.id}>
          <div>
            <div className="small fw-semibold">{doc.nombre}</div>
            <CategoryBadge area={doc.area} />
          </div>
          <StatusBadge estado={doc.estado} />
        </div>
      ))}
      <button type="button" className="btn btn-link btn-sm ps-0 mt-2 text-decoration-none" onClick={onViewHistorial}>
        Ver historial completo →
      </button>
    </div>
  );
}
