import { useState } from 'react';
import AreaSummaryRow from '../components/AreaSummaryRow';
import Dropzone from '../components/Dropzone';
import DemoDocsList from '../components/DemoDocsList';
import RecentDocumentsCard from '../components/RecentDocumentsCard';
import AreaDistributionCard from '../components/AreaDistributionCard';

export default function UploadPage({ documentos, onStartProcessing, onSimulateError, onViewHistorial }) {
  const [file, setFile] = useState(null);
  const [pendingResultId, setPendingResultId] = useState(null);

  const handleDemoSelect = (demo) => {
    setFile({ nombre: demo.nombre, size: '1.84 MB' });
    setPendingResultId(demo.resultId);
  };

  const handleFileSelected = (selected) => {
    setFile(selected);
    setPendingResultId(null); // archivo real: usará un resultado genérico
  };

  const handleSubmit = () => {
    if (!file) return;
    onStartProcessing({ file, resultId: pendingResultId });
  };

  return (
    <>
      <AreaSummaryRow documentos={documentos} />

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card-plain p-4">
            <h5 className="fw-bold mb-1">Subir Documento</h5>
            <p className="text-muted-soft small mb-3">La IA detectará automáticamente el área destino.</p>

            <Dropzone file={file} onFileSelected={handleFileSelected} onRemoveFile={() => { setFile(null); setPendingResultId(null); }} />

            <div className="mt-4">
              <DemoDocsList onSelectDemo={handleDemoSelect} />
            </div>

            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={!file}
                onClick={handleSubmit}
              >
                <i className="bi bi-lightning-charge-fill" />
                Subir y Clasificar
              </button>
              <button type="button" className="btn btn-link text-muted-soft text-decoration-none p-0" onClick={onSimulateError}>
                Simular error →
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <RecentDocumentsCard documentos={documentos} onViewHistorial={onViewHistorial} />
          <AreaDistributionCard documentos={documentos} />
        </div>
      </div>
    </>
  );
}
