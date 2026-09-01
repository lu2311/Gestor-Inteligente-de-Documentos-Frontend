import CategoryConfidenceCard from '../components/CategoryConfidenceCard';
import ExtractedDataGrid from '../components/ExtractedDataGrid';
import SummaryBox from '../components/SummaryBox';
import DerivationStatusCard from '../components/DerivationStatusCard';

export default function ResultsPage({ documento, fileName, onUploadAnother, onViewHistorial }) {
  if (!documento) return null;

  return (
    <div className="mx-auto" style={{ maxWidth: 620 }}>
      <div className="text-center mb-4">
        <div className="result-check-circle">
          <i className="bi bi-check-lg" />
        </div>
        <h5 className="fw-bold mb-1">¡Documento procesado exitosamente!</h5>
        <div className="text-muted-soft small">{fileName || documento.nombre}</div>
      </div>

      <CategoryConfidenceCard area={documento.categoria} confianza={Math.round(documento.confianza * 100)}/>
      {/*<ExtractedDataGrid datos={documento.datos} />*/}
      <SummaryBox resumen={`Documento clasificado automáticamente en ${documento.categoria}.`} />
      <DerivationStatusCard correo={documento.correoDerivacion} />

      <div className="d-flex gap-2">
        <button type="button" className="btn btn-primary flex-fill" onClick={onUploadAnother}>
          Subir otro documento
        </button>
        <button type="button" className="btn btn-outline-primary flex-fill" onClick={onViewHistorial}>
          Ver historial completo
        </button>
      </div>
    </div>
  );
}
