import { AREAS, AREA_CONFIG } from '../data/mockDocuments';

export default function AreaDistributionCard({ documentos }) {
  const total = documentos.length || 1;

  return (
    <div className="card-plain p-3">
      <h6 className="fw-bold mb-3">Distribución por área</h6>
      {AREAS.map((area) => {
        const config = AREA_CONFIG[area];
        const count = documentos.filter((d) => d.area === area).length;
        const pct = Math.round((count / total) * 100);
        return (
          <div className="mb-3" key={area}>
            <div className="d-flex justify-content-between align-items-center small mb-1">
              <span className="d-flex align-items-center gap-2">
                <i className={`bi ${config.icon}`} style={{ color: config.text }} />
                {area}
              </span>
              <span className="text-muted-soft">{count} docs</span>
            </div>
            <div className="area-progress-track">
              <div className="area-progress-fill" style={{ width: `${pct}%`, backgroundColor: config.text }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
