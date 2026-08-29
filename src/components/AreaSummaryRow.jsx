import { AREAS, AREA_CONFIG } from '../data/mockDocuments';

export default function AreaSummaryRow({ documentos }) {
  return (
    <div className="row g-3 mb-4">
      {AREAS.map((area) => {
        const config = AREA_CONFIG[area];
        const count = documentos.filter((d) => d.area === area).length;
        return (
          <div className="col-6 col-md" key={area}>
            <div className="kpi-mini">
              <span className="icon-box" style={{ backgroundColor: config.bg, color: config.text }}>
                <i className={`bi ${config.icon}`} />
              </span>
              <div>
                <div className="value">{count}</div>
                <div className="label">{area}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
