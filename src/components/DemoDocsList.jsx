import { demoFiles } from '../data/mockDocuments';

export default function DemoDocsList({ onSelectDemo }) {
  return (
    <div className="mb-4">
      <div className="text-muted-soft small text-uppercase fw-semibold mb-2" style={{ letterSpacing: '0.03em' }}>
        O prueba con un documento demo:
      </div>
      <div className="d-flex flex-wrap gap-2">
        {demoFiles.map((doc) => (
          <button
            key={doc.nombre}
            type="button"
            className="demo-doc-chip"
            onClick={() => onSelectDemo(doc)}
          >
            <i className={`bi ${doc.icon}`} />
            {doc.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
