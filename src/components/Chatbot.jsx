import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AREA_CONFIG } from '../data/mockDocuments';
import { searchDocuments } from '../services/api';

const SALUDO_INICIAL = {
  rol: 'bot',
  texto:
    '¡Hola! 👋 Soy el asistente de documentos. Puedo ayudarte a buscar archivos por nombre. Escribe el nombre o parte del nombre del documento que necesitas.',
};

const BUSQUEDAS_RAPIDAS = ['factura', 'contrato', 'guía', 'orden compra', 'ticket IT'];

function construirRespuesta(query, resultados) {
  if (resultados.length === 0) {
    return `No encontré ningún documento con "${query}". Intenta con otro nombre o categoría (Finanzas, RRHH, Logística, Compras, IT).`;
  }
  if (resultados.length === 1) return `Encontré 1 documento que coincide con "${query}":`;
  return `Encontré ${resultados.length} documentos que coinciden con "${query}":`;
}

function transformDocument(doc) {
  const analysis = doc.document_analysis?.[0];
  return {
    id: doc.id,
    nombre: doc.file_name,
    area: analysis?.document_category || 'Sin clasificar',
    fecha: doc.upload_date ? new Date(doc.upload_date).toLocaleDateString('es-ES') : '—',
    tamano: '—',
    descargaUrl: doc.storage_url || '#',
    confidence: analysis?.confidence_percentage,
    resumen: analysis?.ai_summary,
  };
}

export default function Chatbot() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([SALUDO_INICIAL]);
  const [input, setInput] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const [noLeidos, setNoLeidos] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, escribiendo]);

  useEffect(() => {
    if (abierto) {
      setNoLeidos(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [abierto]);

  const buscarDocumentosAPI = async (query) => {
    if (!query.trim()) return [];
    try {
      const data = await searchDocuments(query);
      return data.map(transformDocument);
    } catch (error) {
      console.error('Error buscando documentos:', error);
      return [];
    }
  };

  const enviar = async (texto) => {
    const query = (texto ?? input).trim();
    if (!query || escribiendo) return;
    setInput('');
    setMensajes((prev) => [...prev, { rol: 'user', texto: query }]);
    setEscribiendo(true);

    try {
      const resultados = await buscarDocumentosAPI(query);
      const respuesta = construirRespuesta(query, resultados);
      setEscribiendo(false);
      setMensajes((prev) => [...prev, { rol: 'bot', texto: respuesta, resultados: resultados.length ? resultados : undefined }]);
      if (!abierto) setNoLeidos((n) => n + 1);
    } catch (error) {
      setEscribiendo(false);
      setMensajes((prev) => [...prev, { rol: 'bot', texto: 'Error al buscar documentos. Intenta de nuevo.' }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') enviar();
  };

  const handleDescargar = (doc) => (e) => {
    e.preventDefault();
    if (doc.descargaUrl && doc.descargaUrl !== '#') {
      window.open(doc.descargaUrl, '_blank');
    } else {
      window.alert(`Descargando: ${doc.nombre}\n\n(El documento no tiene URL de descarga configurada)`);
    }
  };

  return (
    <>
      <button
        type="button"
        className="chatbot-fab"
        onClick={() => setAbierto((o) => !o)}
        aria-label="Abrir asistente de documentos"
      >
        <i className={`bi ${abierto ? 'bi-x-lg' : 'bi-robot'}`} />
        {!abierto && noLeidos > 0 && <span className="badge-unread">{noLeidos}</span>}
      </button>

      {abierto && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <span className="avatar">
              <i className="bi bi-robot" />
            </span>
            <div className="flex-fill">
              <div className="fw-semibold small">Asistente de Documentos</div>
              <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.7rem', opacity: 0.85 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                En línea · Base de datos activa
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={() => setAbierto(false)} />
          </div>

          <div className="chatbot-body">
            {mensajes.map((msg, i) => (
              <div key={i} className={`d-flex flex-column gap-2 ${msg.rol === 'user' ? 'align-items-end' : 'align-items-start'}`}>
                {msg.texto && <div className={`chat-bubble ${msg.rol}`}>{msg.texto}</div>}
                {msg.resultados?.map((doc) => {
                  const config = AREA_CONFIG[doc.area] || { bg: '#6c757d', text: '#fff', icon: 'bi-file-earmark-text' };
                  return (
                    <div className="chat-doc-card w-100" key={doc.id}>
                      <span className="chat-doc-icon" style={{ backgroundColor: config.bg, color: config.text }}>
                        <i className={`bi ${config.icon}`} />
                      </span>
                      <div className="flex-fill" style={{ minWidth: 0 }}>
                        <div className="fw-semibold text-truncate">{doc.nombre}</div>
                        <div className="text-muted-soft" style={{ fontSize: '0.72rem' }}>
                          {doc.area} · {doc.fecha} · {doc.tamano}
                          {doc.confidence && ` · Confianza: ${doc.confidence}%`}
                        </div>
                        {doc.resumen && (
                          <div className="text-muted-soft" style={{ fontSize: '0.68rem', marginTop: 2 }}>
                            {doc.resumen.substring(0, 100)}...
                          </div>
                        )}
                      </div>
                      <a
                        href={doc.descargaUrl}
                        onClick={handleDescargar(doc)}
                        className="btn btn-success btn-sm d-flex align-items-center gap-1 flex-shrink-0"
                        style={{ fontSize: '0.72rem' }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="bi bi-download" />
                        Descargar
                      </a>
                    </div>
                  );
                })}
              </div>
            ))}

            {escribiendo && (
              <div className="chatbot-typing">
                <span /><span /><span />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {mensajes.length <= 1 && (
            <div className="px-3 py-2 d-flex flex-wrap gap-2 border-top bg-white">
              <div className="w-100 text-muted-soft" style={{ fontSize: '0.7rem' }}>Búsquedas frecuentes:</div>
              {BUSQUEDAS_RAPIDAS.map((q) => (
                <button key={q} type="button" className="chat-quick-btn" onClick={() => { setInput(q); inputRef.current?.focus(); }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="p-2 border-top d-flex align-items-center gap-2 bg-white">
            <input
              ref={inputRef}
              type="text"
              className="form-control form-control-sm"
              placeholder="Buscar documento por nombre..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className="btn btn-primary btn-sm d-flex align-items-center justify-content-center"
              style={{ width: 34, height: 34 }}
              disabled={!input.trim() || escribiendo}
              onClick={() => enviar()}
            >
              <i className="bi bi-send" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}