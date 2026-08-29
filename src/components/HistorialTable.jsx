import CategoryBadge from './CategoryBadge';
import StatusBadge from './StatusBadge';

export default function HistorialTable({ documentos, onVerDocumento }) {
  if (documentos.length === 0) {
    return (
      <div className="text-center text-muted-soft py-5">
        <i className="bi bi-inbox fs-2 d-block mb-2" />
        No se encontraron documentos con estos criterios.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table historial-table mb-0">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {documentos.map((doc) => (
            <tr key={doc.id}>
              <td className="fw-semibold">{doc.nombre}</td>
              <td><CategoryBadge area={doc.area} /></td>
              <td className="text-muted-soft">{doc.fecha} - {doc.hora}</td>
              <td><StatusBadge estado={doc.estado} /></td>
              <td>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-decoration-none"
                  onClick={() => onVerDocumento(doc)}
                >
                  Ver →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
