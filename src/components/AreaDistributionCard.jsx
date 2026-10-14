import { AREAS, AREA_CONFIG } from '../data/mockDocuments';

export default function AreaDistributionCard({ documentos = [] }) {
  const total = documentos.length;

  return (
    <div className="card-plain area-distribution-card p-3">
      <h6 className="fw-bold mb-3">
        Distribución por área
      </h6>

      <div className="area-distribution-list">
        {AREAS.map((area) => {
          const config = AREA_CONFIG[area];
          const count = documentos.filter(
            (d) => d.area === area
          ).length;

          const pct = total > 0
            ? Math.round((count / total) * 100)
            : 0;

          return (
            <div className="area-distribution-item" key={area}>
              <div className="area-distribution-info">
                <div className="area-distribution-name">
                  <i
                    className={`bi ${config.icon} area-distribution-icon`}
                    style={{ color: config.text }}
                    aria-hidden="true"
                  />

                  <span className="area-distribution-label">
                    {area}
                  </span>
                </div>

                <span className="text-muted-soft area-distribution-count">
                  {count} docs
                </span>
              </div>

              <div
                className="area-progress-track"
                role="progressbar"
                aria-label={`${area}: ${pct}%`}
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="area-progress-fill"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: config.text,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}