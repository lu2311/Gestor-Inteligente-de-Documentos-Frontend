export default function ExtractedDataGrid({ datos }) {
  const fields = [
    { label: 'Proveedor', value: datos.proveedor },
    { label: 'Fecha', value: datos.fecha },
    { label: 'Monto', value: datos.monto },
    { label: 'N° Documento', value: datos.numeroDocumento },
  ];

  return (
    <div className="card-plain p-3 mb-3">
      <div className="text-muted-soft small text-uppercase fw-semibold mb-3" style={{ letterSpacing: '0.03em' }}>
        Datos extraídos
      </div>
      <div className="row g-2">
        {fields.map((field) => (
          <div className="col-6" key={field.label}>
            <div className="data-field">
              <div className="field-label">{field.label}</div>
              <div className="fw-semibold">{field.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
