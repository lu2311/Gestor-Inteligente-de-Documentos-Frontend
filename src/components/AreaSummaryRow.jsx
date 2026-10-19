import { getAreaDistribution } from '../data/mockDocuments';

export default function AreaSummaryRow({ documentos = [] }) {
  const filas = getAreaDistribution(documentos);

  return (
    <div className="row g-3 mb-4">
      {filas.map(({ area, label, count, config }) => {
        return (
          <div className="col-6 col-md" key={area}>
            <div className="kpi-mini">
              <span className="icon-box" style={{ backgroundColor: config.bg, color: config.text }}>
                <i className={`bi ${config.icon}`} />
              </span>
              <div>
                <div className="value">{count}</div>
                <div className="label">{label}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
