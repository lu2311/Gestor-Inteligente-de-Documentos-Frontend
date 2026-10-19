import { getAreaDistribution } from '../data/mockDocuments';

export default function AreaDistributionCard({ documentos = [] }) {
  const total = documentos.length;
  const filas = getAreaDistribution(documentos);

  return (
    <div className="card-plain p-3">
      <h6 className="fw-bold mb-3">Distribución por área</h6>
      {filas.map(({ area, label, count, config }) => {
        const pct = total ? Math.round((count / total) * 100) : 0;
        return (
          <div className="mb-3" key={area}>
            <div className="d-flex justify-content-between align-items-center small mb-1">
              <span className="d-flex align-items-center gap-2">
                <i className={`bi ${config.icon}`} style={{ color: config.text }} />
                {label}
              </span>
              <span className="text-muted-soft">{count} docs</span>
            </div>
            <div className="area-progress-track">
              <div
                className="area-progress-fill"
                style={{ width: `${pct}%`, backgroundColor: config.text }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
