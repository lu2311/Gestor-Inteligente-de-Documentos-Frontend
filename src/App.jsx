import { useEffect, useState, useCallback } from 'react';
import AppHeader from './components/AppHeader';
import ProcessingModal from './components/ProcessingModal';
import Chatbot from './components/Chatbot';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import HistorialPage from './pages/HistorialPage';
import ErrorState from './components/ErrorState';
import {
  uploadDocument,
  checkJobStatus,
  getDocuments,
  normalizeDocument,
  getDestinationEmail,
} from './services/api';

// Vistas posibles: 'upload' | 'processing' | 'results' | 'historial' | 'error'
export default function App() {
  const [view, setView] = useState('upload');
  const [documentos, setDocumentos] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [notificaciones, setNotificaciones] = useState(() => {
    try {
      const saved = localStorage.getItem('gestor-notificaciones-v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeDocument, setActiveDocument] = useState(null);
  const [activeFileName, setActiveFileName] = useState(null);
  const [failedFileName, setFailedFileName] = useState(null);
  const [processingStep, setProcessingStep] = useState('Extrayendo texto...');
  const [errorMessage, setErrorMessage] = useState('');

  // Sincronizar notificaciones en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gestor-notificaciones-v1', JSON.stringify(notificaciones));
    } catch (e) {
      console.warn('Error guardando notificaciones:', e);
    }
  }, [notificaciones]);

  // Cargar historial de documentos directamente desde Supabase
  const cargarDocumentos = useCallback(async () => {
    try {
      setLoadingDocs(true);
      const docs = await getDocuments();
      if (Array.isArray(docs)) {
        setDocumentos(docs);

        // Reconciliar la sección de notificaciones con los documentos procesados en Supabase
        setNotificaciones((prevNotifs) => {
          const existingIds = new Set(prevNotifs.map((n) => n.id));
          const nuevasDeBd = [];

          docs.forEach((doc) => {
            const notifId = `notif-doc-${doc.id}`;
            if (!existingIds.has(notifId) && (doc.estado === 'Procesado' || doc.processing_status === 'completed')) {
              nuevasDeBd.push({
                id: notifId,
                documentId: doc.id,
                archivo: doc.nombre || doc.fileName,
                correo: doc.correoDerivacion || getDestinationEmail(doc.tipoDocumento, doc.area),
                area: doc.area,
                hora: doc.hora || 'Reciente',
                fecha: doc.fecha || '',
                leido: true,
              });
            }
          });

          return [...prevNotifs, ...nuevasDeBd];
        });
      }
    } catch (err) {
      console.error('Error cargando historial de Supabase:', err);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    cargarDocumentos();
  }, [cargarDocumentos]);

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

      // 2. Si está en cola, iniciar el polling
      if (initialResponse.status === 'pending' && initialResponse.jobId) {
        setProcessingStep('Procesando con IA (esto puede tomar unos segundos)...');

        let jobCompleted = false;
        let attempts = 0;
        const maxAttempts = 35; // ~70s

        while (!jobCompleted && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          attempts++;

          const statusResponse = await checkJobStatus(initialResponse.jobId);

          if (statusResponse.status === 'completed') {
            jobCompleted = true;
            const resultado = statusResponse.result ?? {};
            const now = new Date();

            const documentoProcesado = normalizeDocument({
              id: resultado.documentId || `ia-${now.getTime()}`,
              file_name: resultado.fileName || fileData.nombre,
              processing_status: 'completed',
              tipoDocumento: resultado.tipoDocumento || 'Desconocido',
              area: resultado.area || 'Sin asignar',
              confianza: resultado.confianza || 0,
              derivacion: resultado.derivacion || 'Derivación pendiente',
              campos: resultado.campos || {},
              informeEjecutivo: resultado.informeEjecutivo || {},
              resumenEjecutivo: resultado.resumenEjecutivo || '',
              storage_url: resultado.storageUrl,
              upload_date: now.toISOString(),
            });

            // Registrar notificación visible con nombre de documento y correo al que se derivó
            const nuevaNotif = {
              id: `notif-${now.getTime()}`,
              documentId: documentoProcesado.id,
              archivo: documentoProcesado.nombre,
              correo: documentoProcesado.correoDerivacion,
              area: documentoProcesado.area,
              hora: documentoProcesado.hora,
              fecha: documentoProcesado.fecha,
              leido: false,
            };

            setNotificaciones((actuales) => [nuevaNotif, ...actuales]);
            setActiveDocument(documentoProcesado);
            setDocumentos((actuales) => [documentoProcesado, ...actuales.filter((d) => d.id !== documentoProcesado.id)]);
            setView('results');

            // Refrescar lista completa desde Supabase
            cargarDocumentos();

          } else if (statusResponse.status === 'failed') {
            jobCompleted = true;
            throw new Error(statusResponse.error || 'El procesamiento falló en el servidor');
          } else {
            setProcessingStep(`Procesando con IA... (Consulta ${attempts}/${maxAttempts})`);
          }
        }

        if (!jobCompleted) {
          throw new Error('Tiempo de espera agotado. El documento es muy grande o el servidor está ocupado.');
        }

      } else {
        // Fallback síncrono
        const resultado = initialResponse;
        const now = new Date();

        const documentoProcesado = normalizeDocument({
          id: resultado.documentId || `ia-${now.getTime()}`,
          file_name: resultado.fileName || fileData.nombre,
          processing_status: 'completed',
          tipoDocumento: resultado.tipoDocumento || 'Desconocido',
          area: resultado.area || 'Sin asignar',
          confianza: resultado.confianza || 0,
          derivacion: resultado.derivacion || 'Derivación pendiente',
          campos: resultado.campos || {},
          informeEjecutivo: resultado.informeEjecutivo || {},
          resumenEjecutivo: resultado.resumenEjecutivo || '',
          storage_url: resultado.storageUrl,
          upload_date: now.toISOString(),
        });

        const nuevaNotif = {
          id: `notif-${now.getTime()}`,
          documentId: documentoProcesado.id,
          archivo: documentoProcesado.nombre,
          correo: documentoProcesado.correoDerivacion,
          area: documentoProcesado.area,
          hora: documentoProcesado.hora,
          fecha: documentoProcesado.fecha,
          leido: false,
        };

        setNotificaciones((actuales) => [nuevaNotif, ...actuales]);
        setActiveDocument(documentoProcesado);
        setDocumentos((actuales) => [documentoProcesado, ...actuales.filter((d) => d.id !== documentoProcesado.id)]);
        setView('results');

        cargarDocumentos();
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
      <AppHeader
        onLogoClick={goToUpload}
        notificaciones={notificaciones}
        onMarkAllRead={() => setNotificaciones((prev) => prev.map((n) => ({ ...n, leido: true })))}
        onClearNotifications={() => setNotificaciones([])}
      />

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
          <HistorialPage
            documentos={documentos}
            onBack={goToUpload}
            onVerDocumento={handleVerDocumento}
            onRefresh={cargarDocumentos}
            loading={loadingDocs}
          />
        )}

        {view === 'error' && (
          <ErrorState
            fileName={failedFileName}
            message={errorMessage}
            onRetry={goToUpload}
            onGoHome={goToUpload}
          />
        )}
      </div>

      {view === 'processing' && <ProcessingModal step={processingStep} />}

      <Chatbot />
    </div>
  );
}