import { useEffect, useState } from 'react';
import AreaSummaryRow from '../components/AreaSummaryRow';
import Dropzone from '../components/Dropzone';
import RecentDocumentsCard from '../components/RecentDocumentsCard';
import AreaDistributionCard from '../components/AreaDistributionCard';
import CameraCapture from '../components/CameraCapture';

export default function UploadPage({
  documentos,
  onStartProcessing,
  onStartMobileProcessing,
  onSimulateError,
  onViewHistorial,
}) {
  const [file, setFile] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraNotice, setCameraNotice] = useState(null);
  const [mobileCapture, setMobileCapture] = useState(false);

  const handleFileSelected = (selected) => {
    setFile(selected);
    setMobileCapture(false);
  };

  const handleSubmit = () => {
    if (!file) return;
    if (mobileCapture && onStartMobileProcessing) {
      onStartMobileProcessing(file);
      return;
    }
    onStartProcessing(file);
  };

  // La foto de la cámara entra por el mismo camino que un archivo elegido en el Dropzone.
  // `photoFile` es un File nativo (JPEG). Si tu Dropzone entrega otro formato (por ejemplo
  // { nombre, size, file }), adáptalo aquí: es el único punto de integración.
  const handleCameraConfirm = (photoFile) => {
    setFile({
      file: photoFile,
      nombre: photoFile.name,
      size: `${(photoFile.size / (1024 * 1024)).toFixed(2)} MB`,
    });
    setMobileCapture(true);
    setCameraOpen(false);
    setCameraNotice(`Foto capturada correctamente (${photoFile.name}). Ya puedes clasificarla.`);
  };

  // El aviso de confirmación se oculta solo después de unos segundos.
  useEffect(() => {
    if (!cameraNotice) return undefined;
    const timer = setTimeout(() => setCameraNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [cameraNotice]);

  return (
    <>
      <div className="summary-wrap">
        <AreaSummaryRow documentos={documentos} />
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card-plain p-3 p-md-4">
            <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-start justify-content-between gap-3">
              <div>
                <h5 className="fw-bold mb-1">Subir Documento</h5>
                <p className="text-muted-soft small mb-0">
                  La IA detectará automáticamente el área destino.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 flex-shrink-0"
                onClick={() => setCameraOpen(true)}
              >
                <i className="bi bi-camera" aria-hidden="true" />
                Registrar con cámara
              </button>
            </div>

            {cameraNotice && (
              <div
                className="alert alert-success d-flex align-items-start gap-2 py-2 px-3 small mt-3 mb-0"
                role="status"
              >
                <i className="bi bi-check-circle-fill mt-1" aria-hidden="true" />
                <span className="flex-fill text-break">{cameraNotice}</span>
                <button
                  type="button"
                  className="btn-close btn-sm"
                  aria-label="Cerrar aviso"
                  onClick={() => setCameraNotice(null)}
                />
              </div>
            )}

            <Dropzone
              file={file}
              onFileSelected={handleFileSelected}
              onRemoveFile={() => {
                setFile(null);
              }}
            />

            <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 gap-sm-3">
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-4"
                disabled={!file}
                onClick={handleSubmit}
              >
                <i className="bi bi-lightning-charge-fill" aria-hidden="true" />
                Subir y Clasificar
              </button>
              <button
                type="button"
                className="btn btn-link text-muted-soft text-decoration-none p-2 p-sm-0"
                onClick={onSimulateError}
              >
                Simular error →
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* 1 columna en móvil, 2 en tablet y apiladas en escritorio (ver .sidebar-cards en App.css). */}
          <div className="sidebar-cards">
            <RecentDocumentsCard documentos={documentos} onViewHistorial={onViewHistorial} />
            <AreaDistributionCard documentos={documentos} />
          </div>
        </div>
      </div>

      {cameraOpen && (
        <CameraCapture onConfirm={handleCameraConfirm} onClose={() => setCameraOpen(false)} />
      )}
    </>
  );
}
