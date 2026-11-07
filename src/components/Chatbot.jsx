import { useEffect, useRef, useState } from 'react';
import { chatStream } from '../services/api';
import { fixEncoding } from '../utils/fixEncoding';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '¡Hola! Soy tu asistente inteligente (Gemini). Puedo responder preguntas sobre los documentos almacenados en Supabase o trámites SUNAT.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendQuery = async (queryText, options = {}) => {
    if (!queryText.trim() || isTyping) return;

    const userMessage = { role: 'user', content: queryText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const assistantMessageId = Date.now();
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '', id: assistantMessageId, results: [] },
    ]);

    try {
      const historyForApi = messages.map((m) => ({ role: m.role, content: m.content }));
      historyForApi.push({ role: 'user', content: userMessage.content });

      let currentText = '';
      let currentResults = [];

      for await (const chunk of chatStream(userMessage.content, historyForApi, options)) {
        if (chunk.type === 'content' && chunk.content) {
          currentText += chunk.content;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMessageId ? { ...m, content: currentText } : m)),
          );
        } else if (chunk.type === 'tool_results' && chunk.results) {
          currentResults = chunk.results.flatMap((r) =>
            r.results ? r.results : r.nombre ? [r] : [],
          );
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMessageId ? { ...m, results: currentResults } : m)),
          );
        } else if (chunk.type === 'error') {
          throw new Error(chunk.error || 'Error en el stream');
        }
      }
    } catch (error) {
      console.error('Error en el chat:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                content:
                  'Lo siento, hubo un error al conectar con Gemini o el backend. Por favor verifica que los servicios estén activos.',
              }
            : m,
        ),
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendQuery(input);
  };

  return (
    <>
      {/* Botón flotante */}
      <button className="chatbot-fab" onClick={() => setIsOpen(!isOpen)} aria-label="Abrir chat">
        <i className={`bi bi-${isOpen ? 'x-lg' : 'chat-dots-fill'}`} />
      </button>

      {/* Panel del Chat */}
      {isOpen && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="avatar">
              <i className="bi bi-robot" />
            </div>
            <div className="flex-grow-1">
              <div className="fw-bold">Asistente documental</div>
              <div className="small opacity-75">Gemini • Documentos</div>
            </div>
            <button
              type="button"
              className="chatbot-docs-btn"
              onClick={() =>
                sendQuery('Muéstrame los documentos registrados', { includeDocuments: true })
              }
              disabled={isTyping}
              title="Ver documentos registrados"
              aria-label="Ver documentos registrados"
            >
              <i className="bi bi-folder2-open" />
              <span>Documentos</span>
            </button>
          </div>

          <div className="chatbot-body">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}
              >
                <div className="text-content" style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content ||
                    (msg.role === 'assistant' && isTyping && idx === messages.length - 1
                      ? 'Pensando y consultando Supabase...'
                      : '')}
                </div>

                {/* Tarjetas de documentos recomendados / encontrados en Supabase */}
                {msg.results && msg.results.length > 0 && (
                  <div className="mt-2 d-flex flex-column gap-2">
                    <div className="text-muted fw-semibold" style={{ fontSize: '0.72rem' }}>
                      📄 Documentos relevantes en Supabase:
                    </div>
                    {msg.results.map((doc, i) => (
                      <a
                        key={i}
                        href={doc.descargaUrl || '#'}
                        className="document-card p-2 rounded border bg-light text-decoration-none d-flex align-items-center gap-2"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver / Descargar archivo del bucket"
                      >
                        <i className="bi bi-file-earmark-pdf-fill text-danger fs-4" />
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="fw-semibold small text-truncate">
                            {fixEncoding(doc.nombre)}
                          </div>
                          <div className="text-muted text-truncate" style={{ fontSize: '0.7rem' }}>
                            {doc.tipoDocumento} • {doc.area}
                          </div>
                        </div>
                        <i className="bi bi-download text-primary ms-auto" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Sugerencias iniciales rápidas */}
            {messages.length === 1 && !isTyping && (
              <div className="d-flex flex-wrap gap-1 mt-2">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm rounded-pill py-1 px-2"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() =>
                    sendQuery('¿Qué documentos hay subidos en Supabase?', {
                      includeDocuments: true,
                    })
                  }
                >
                  📄 Ver documentos
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm rounded-pill py-1 px-2"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() =>
                    sendQuery('¿Qué documentos de RUC están registrados y cuáles son sus datos?')
                  }
                >
                  🔍 Buscar por RUC
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm rounded-pill py-1 px-2"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => sendQuery('¿A qué áreas se han derivado los documentos?')}
                >
                  🏛️ Ver derivaciones
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-footer p-2 border-top" onSubmit={handleSend}>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Pregunta sobre tus documentos..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
              />
              <button
                className="btn btn-primary btn-sm"
                type="submit"
                disabled={isTyping || !input.trim()}
              >
                <i className="bi bi-send-fill" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
