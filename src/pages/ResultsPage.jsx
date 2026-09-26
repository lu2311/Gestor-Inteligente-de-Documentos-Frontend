// src/pages/ResultsPage.jsx
import { useState } from 'react';
import CategoryConfidenceCard from '../components/CategoryConfidenceCard';
import SummaryBox from '../components/SummaryBox';
import DerivationStatusCard from '../components/DerivationStatusCard';
import ExecutiveReport from '../components/ExecutiveReport';
import EmailToast from '../components/EmailToast';

export default function ResultsPage({
  documento,
  fileName,
  onUploadAnother,
  onViewHistorial
}) {
  const [showToast, setShowToast] = useState(true);

  if (!documento) return null;

  const confianza = Number(documento.confianza);
  const docFileName = fileName || documento.fileName || documento.nombre || 'Documento';
  const targetEmail = documento.correoDerivacion || 'derivaciones@sunat.gob.pe';

  return (
    <div className="mx-auto" style={{ maxWidth: 800 }}>
      {showToast && (
        <EmailToast
          archivo={docFileName}
          area={documento.area}
          correo={targetEmail}
          onSent={() => {}}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="text-center mb-4">
        <div className="result-check-circle">
          <i className="bi bi-check-lg" />
        </div>

        <h5 className="fw-bold mb-1">
          ¡Documento procesado exitosamente!
        </h5>

        <div className="text-muted-soft small d-flex align-items-center justify-content-center gap-2">
          <span>{docFileName}</span>
          {documento.storageUrl && documento.storageUrl !== '#' && (
            <a
              href={documento.storageUrl}
              target="_blank"
              rel="noreferrer"
              className="badge bg-light text-primary border text-decoration-none"
              title="Abrir archivo guardado en Supabase Storage (DocumentosIA)"
            >
              <i className="bi bi-file-earmark-arrow-down me-1" />
              Ver en Storage
            </a>
          )}
        </div>
      </div>

      <CategoryConfidenceCard
        tipoDocumento={documento.tipoDocumento}
        confianza={Number.isFinite(confianza) ? Math.round(confianza * 100) : (documento.categoriaConfianza || 95)}
      />

      {/* NUEVO: Informe Ejecutivo Completo */}
      {documento.informeEjecutivo && Object.keys(documento.informeEjecutivo).length > 0 && (
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
            resumen={documento.resumenEjecutivo || documento.resumen || `Documento clasificado como ${documento.tipoDocumento} en área ${documento.area}.`}
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
        correo={targetEmail}
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