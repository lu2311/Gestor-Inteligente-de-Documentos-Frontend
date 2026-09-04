// src/pages/ResultsPage.jsx
import CategoryConfidenceCard from '../components/CategoryConfidenceCard';
import SummaryBox from '../components/SummaryBox';
import DerivationStatusCard from '../components/DerivationStatusCard';

export default function ResultsPage({
  documento,
  fileName,
  onUploadAnother,
  onViewHistorial
}) {
  if (!documento) return null;

  const confianza = Number(documento.confianza);

  return (
    <div className="mx-auto" style={{ maxWidth: 620 }}>
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

      <SummaryBox
        resumen={`Documento clasificado como ${documento.tipoDocumento} en área ${documento.area}.`}
      />

      <DerivationStatusCard
        correo={documento.derivacion}
      />

      <div className="d-flex gap-2">
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