import { useEffect, useState } from 'react';
import AppHeader from './components/AppHeader';
import ProcessingModal from './components/ProcessingModal';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import HistorialPage from './pages/HistorialPage';
import ErrorState from './components/ErrorState';
import { uploadDocument } from './services/api';

// Vistas posibles: 'upload' | 'processing' | 'results' | 'historial' | 'error'
export default function App() {
  const [view, setView] = useState('upload');
  const [documentos, setDocumentos] = useState([]);
  const [activeDocument, setActiveDocument] = useState(null);
  const [activeFileName, setActiveFileName] = useState(null);
  const [failedFileName, setFailedFileName] = useState(null);
  const [processingStep, setProcessingStep] = useState('Extrayendo texto...');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    window.localStorage.removeItem('gestor-documentos-historial');
    window.localStorage.setItem('gestor-documentos-historial', JSON.stringify(documentos));
  }, [documentos]);


  const goToUpload = () => {
    setView('upload');
    setActiveDocument(null);
    setActiveFileName(null);
    setFailedFileName(null);
  };
  const handleStartProcessing = async (fileData) => {
    if (!fileData?.file) return;

    setActiveFileName(fileData.nombre);
    setProcessingStep('Extrayendo texto...');
    setView('processing');

    const stepTimer = setTimeout(() => {
      setProcessingStep('Clasificando con IA...');
    }, 2500);

try {
      const resultado = await uploadDocument(fileData.file);
      const now = new Date();
      const documentoProcesado = {
        id: `ia-${now.getTime()}`,
        nombre: resultado.fileName,
        tipoDocumento: resultado.tipoDocumento,
        area: resultado.area,
        confianza: resultado.confianza,
        categoriaConfianza: Math.round(Number(resultado.confianza || 0) * 100),
        derivacion: resultado.derivacion,
        campos: resultado.campos || {},
        informeEjecutivo: resultado.informeEjecutivo || {},
        resumenEjecutivo: resultado.resumenEjecutivo || '',
        estado: 'Procesado',
        fecha: now.toLocaleDateString('es-PE'),
        hora: now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        datos: [],
        resumen: `Documento clasificado automáticamente como ${resultado.tipoDocumento} en área ${resultado.area}.`
      };

      setActiveDocument(documentoProcesado);
      setDocumentos((actuales) => [documentoProcesado, ...actuales]);

      clearTimeout(stepTimer);
      setView('results');
    } catch (error) {
      clearTimeout(stepTimer);

      if (error.status === 400) {
        setErrorMessage('Tipo de archivo no soportado.');
      } else if (error.status === 500) {
        setErrorMessage('La IA no pudo procesar el documento.');
      } else {
        setErrorMessage('No se pudo conectar con el servidor.');
      }

      setFailedFileName(fileData.nombre);
      setView('error');
    }
  };


  const handleSimulateError = () => {
    setFailedFileName('documento_prueba.pdf');
    setView('error');
  };

  const handleVerDocumento = (doc) => {
    setActiveDocument(doc);  // Los docs del mock deben tener tipoDocumento y area
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
            onStartProcessing={() => { }}
            onSimulateError={() => { }}
            onViewHistorial={() => { }}
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
          <ErrorState fileName={failedFileName} message={errorMessage} onRetry={goToUpload} onGoHome={goToUpload} />
        )}
      </div>

      {view === 'processing' && (<ProcessingModal step={processingStep} />)}
    </div>
  );
}