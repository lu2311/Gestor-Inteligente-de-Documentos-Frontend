// src/pages/ResultsPage.jsx
import CategoryConfidenceCard from '../components/CategoryConfidenceCard';
import SummaryBox from '../components/SummaryBox';
import DerivationStatusCard from '../components/DerivationStatusCard';
import ExecutiveReport from '../components/ExecutiveReport';

export default function ResultsPage({
  documento,
  fileName,
  onUploadAnother,
  onViewHistorial
}) {
  if (!documento) return null;

  const confianza = Number(documento.confianza);

  return (
    <div className="mx-auto" style={{ maxWidth: 800 }}>
      <div className="text-center mb-4">
        <div className="result-check-circle">
          <i className="bi bi-check-lg" />
        </div>

        <h5 className="fw-bold mb-1">
          ¡Documento procesado exitosamente!
        </h5>

        <div className="text-muted-soft small">
          {fileName || documento.fileName}
        </div>
      </div>

      <CategoryConfidenceCard
        tipoDocumento={documento.tipoDocumento}
        confianza={Number.isFinite(confianza) ? Math.round(confianza * 100) : 0}
      />

      {/* NUEVO: Informe Ejecutivo Completo */}
      {documento.informeEjecutivo && (
        <ExecutiveReport
          informe={documento.informeEjecutivo}
          tipoDocumento={documento.tipoDocumento}
          area={documento.area}
        />
      )}

      {/* Fallback si no hay informe estructurado */}
      {(!documento.informeEjecutivo || Object.keys(documento.informeEjecutivo).length === 0) && (
        <>
          <SummaryBox
            resumen={documento.resumenEjecutivo || `Documento clasificado como ${documento.tipoDocumento} en área ${documento.area}.`}
          />
          {documento.campos && Object.keys(documento.campos).length > 0 && (
            <div className="card-plain p-3 mb-3">
              <div className="text-muted-soft small text-uppercase fw-semibold mb-2">
                Campos extraídos
              </div>
              <div className="row">
                {Object.entries(documento.campos).map(([key, value]) => (
                  <div key={key} className="col-md-6 mb-2">
                    <div className="text-muted-soft small">{key}</div>
                    <div className="fw-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <DerivationStatusCard
        correo={documento.derivacion}
      />

      <div className="d-flex gap-2 mt-4">
        <button
          type="button"
          className="btn btn-primary flex-fill"
          onClick={onUploadAnother}
        >
          Subir otro documento
        </button>

        <button
          type="button"
          className="btn btn-outline-primary flex-fill"
          onClick={onViewHistorial}
        >
          Ver historial completo
        </button>
      </div>
    </div>
  );
}