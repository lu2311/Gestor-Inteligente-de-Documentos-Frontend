import { useEffect, useState } from 'react';
import AppHeader from './components/AppHeader';
import ProcessingModal from './components/ProcessingModal';
import Chatbot from './components/Chatbot';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import HistorialPage from './pages/HistorialPage';
import ErrorState from './components/ErrorState';
   import { uploadDocument, checkJobStatus } from './services/api';

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
    setProcessingStep('Enviando documento a la cola...');
    setView('processing');

    try {
      // 1. Subir el archivo y recibir el jobId
      const initialResponse = await uploadDocument(fileData.file);

      // 2. Si está en cola, iniciar el polling (consulta periódica)
      if (initialResponse.status === 'pending' && initialResponse.jobId) {
        setProcessingStep('Procesando con IA (esto puede tomar unos segundos)...');
        
        let jobCompleted = false;
        let attempts = 0;
        const maxAttempts = 30; // Máximo 60 segundos de espera (30 * 2s)

        while (!jobCompleted && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
          attempts++;
          
          const statusResponse = await checkJobStatus(initialResponse.jobId);
          
          if (statusResponse.status === 'completed') {
            jobCompleted = true;
            const resultado = statusResponse.result ?? {};
            console.log('🔍 Backend devolvió:', statusResponse);  // ← ver qué llega realmente
            console.log('📄 Resultado extraído:', resultado);
            const now = new Date();
            const documentoProcesado = {
              id: `ia-${now.getTime()}`,
              nombre: resultado.fileName || fileData.nombre,
              tipoDocumento: resultado.tipoDocumento || 'Desconocido',
              area: resultado.area || 'Sin asignar',
              confianza: resultado.confianza || 0,
              categoriaConfianza: Math.round(Number(resultado.confianza || 0) * 100),
              derivacion: resultado.derivacion || 'Derivación pendiente',
              campos: resultado.campos || {},
              informeEjecutivo: resultado.informeEjecutivo || {},
              resumenEjecutivo: resultado.resumenEjecutivo || '',
              estado: 'Procesado',
              fecha: now.toLocaleDateString('es-PE'),
              hora: now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
              datos: [],
              resumen: `Documento clasificado automáticamente como ${resultado.tipoDocumento || 'desconocido'} en área ${resultado.area || 'desconocida'}.`
            };

            setActiveDocument(documentoProcesado);
            setDocumentos((actuales) => [documentoProcesado, ...actuales]);
            setView('results');
            
          } else if (statusResponse.status === 'failed') {
            jobCompleted = true;
            throw new Error(statusResponse.error || 'El procesamiento falló en el servidor');
          } else {
            // Aún está en 'processing' o 'pending'
            setProcessingStep(`Procesando con IA... (Consulta ${attempts}/${maxAttempts})`);
          }
        }

        if (!jobCompleted) {
          throw new Error('Tiempo de espera agotado. El documento es muy grande o el servidor está ocupado.');
        }

      } else {
        // Fallback: Si en el futuro desactivas la cola, esto maneja la respuesta síncrona
        const resultado = initialResponse;
        const now = new Date();
        const documentoProcesado = {
          id: `ia-${now.getTime()}`,
          nombre: resultado.fileName || fileData.nombre,
          tipoDocumento: resultado.tipoDocumento || 'Desconocido',
          area: resultado.area || 'Sin asignar',
          confianza: resultado.confianza || 0,
          categoriaConfianza: Math.round(Number(resultado.confianza || 0) * 100),
          derivacion: resultado.derivacion || 'Derivación pendiente',
          campos: resultado.campos || {},
          informeEjecutivo: resultado.informeEjecutivo || {},
          resumenEjecutivo: resultado.resumenEjecutivo || '',
          estado: 'Procesado',
          fecha: now.toLocaleDateString('es-PE'),
          hora: now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          datos: [],
          resumen: `Documento clasificado automáticamente como ${resultado.tipoDocumento || 'desconocido'} en área ${resultado.area || 'desconocida'}.`
        };

        setActiveDocument(documentoProcesado);
        setDocumentos((actuales) => [documentoProcesado, ...actuales]);
        setView('results');
      }

    } catch (error) {
      if (error.status === 400) {
        setErrorMessage('Tipo de archivo no soportado.');
      } else if (error.status === 500) {
        setErrorMessage('La IA no pudo procesar el documento.');
      } else {
        setErrorMessage(error.message || 'No se pudo conectar con el servidor.');
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

      <Chatbot documentos={documentos} />
    </div>
  );
}