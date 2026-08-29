import { useState } from 'react';
import AppHeader from './components/AppHeader';
import ProcessingModal from './components/ProcessingModal';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import HistorialPage from './pages/HistorialPage';
import ErrorState from './components/ErrorState';
import { mockDocuments } from './data/mockDocuments';

// Vistas posibles: 'upload' | 'processing' | 'results' | 'historial' | 'error'
export default function App() {
  const [view, setView] = useState('upload');
  const [documentos] = useState(mockDocuments);
  const [activeDocument, setActiveDocument] = useState(null);
  const [activeFileName, setActiveFileName] = useState(null);
  const [failedFileName, setFailedFileName] = useState(null);

  const goToUpload = () => {
    setView('upload');
    setActiveDocument(null);
    setActiveFileName(null);
  };

  const handleStartProcessing = ({ file, resultId }) => {
    const resultado = documentos.find((d) => d.id === resultId) || documentos[0];
    setActiveDocument(resultado);
    setActiveFileName(file.nombre);
    setView('processing');
  };

  const handleProcessingComplete = () => {
    setView('results');
  };

  const handleSimulateError = () => {
    setFailedFileName('documento_prueba.pdf');
    setView('error');
  };

  const handleVerDocumento = (doc) => {
    setActiveDocument(doc);
    setActiveFileName(doc.nombre);
    if (doc.estado === 'Fallido') {
      setFailedFileName(doc.nombre);
      setView('error');
    } else {
      setView('results');
    }
  };

  return (
    <div>
      <AppHeader />

      <div className="app-body">
        {view === 'upload' && (
          <UploadPage
            documentos={documentos}
            onStartProcessing={handleStartProcessing}
            onSimulateError={handleSimulateError}
            onViewHistorial={() => setView('historial')}
          />
        )}

        {view === 'processing' && (
          <UploadPage
            documentos={documentos}
            onStartProcessing={() => {}}
            onSimulateError={() => {}}
            onViewHistorial={() => {}}
          />
        )}

        {view === 'results' && (
          <ResultsPage
            documento={activeDocument}
            fileName={activeFileName}
            onUploadAnother={goToUpload}
            onViewHistorial={() => setView('historial')}
          />
        )}

        {view === 'historial' && (
          <HistorialPage documentos={documentos} onBack={goToUpload} onVerDocumento={handleVerDocumento} />
        )}

        {view === 'error' && (
          <ErrorState fileName={failedFileName} onRetry={goToUpload} onGoHome={goToUpload} />
        )}
      </div>

      {view === 'processing' && <ProcessingModal onComplete={handleProcessingComplete} />}
    </div>
  );
}
