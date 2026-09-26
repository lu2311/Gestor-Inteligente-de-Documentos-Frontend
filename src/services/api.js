import { getDestinationEmail, getAreaByDocType } from '../data/mockDocuments';
export { getDestinationEmail, getAreaByDocType };

const API_URL = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
  ? import.meta.env.VITE_API_URL
  : (typeof window !== 'undefined' && window.location.port === '5173' ? 'http://localhost:3000' : '');

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = new Error(`Error ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return await response.json();
}

export async function checkJobStatus(jobId) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${API_URL}/upload/status/${jobId}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`Error ${response.status}`);
    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export function normalizeDocument(rawDoc) {
  if (!rawDoc) return null;

  const analysis = Array.isArray(rawDoc.document_analysis)
    ? rawDoc.document_analysis[0]
    : rawDoc.document_analysis;

  const derivations = Array.isArray(rawDoc.document_derivations)
    ? rawDoc.document_derivations
    : (rawDoc.document_derivations ? [rawDoc.document_derivations] : []);

  const firstDerivation = derivations[0] || {};

  // Formateo de fecha y hora local
  const dateObj = rawDoc.upload_date ? new Date(rawDoc.upload_date) : new Date();
  const fecha = isNaN(dateObj.getTime())
    ? (rawDoc.fecha || '')
    : dateObj.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const hora = isNaN(dateObj.getTime())
    ? (rawDoc.hora || '')
    : dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  // Estado unificado
  let estado = 'Procesado';
  if (rawDoc.processing_status === 'failed' || rawDoc.estado === 'Fallido') {
    estado = 'Fallido';
  } else if (
    rawDoc.processing_status === 'processing' ||
    rawDoc.processing_status === 'pending' ||
    rawDoc.estado === 'En cola'
  ) {
    estado = 'En cola';
  }

  // Tipo y Área detectada
  const tipoDocumento =
    rawDoc.tipoDocumento ||
    analysis?.document_category ||
    (estado === 'Fallido' ? 'No identificado' : 'DOCUMENTO_GENERAL');

  const area =
    rawDoc.area ||
    firstDerivation.target_area ||
    getAreaByDocType(tipoDocumento) ||
    'INTENDENCIA_RECAUDACION_CONTROL_MASIVO';

  // Confianza calculada
  const rawConf = rawDoc.confianza ?? analysis?.confidence_percentage ?? (estado === 'Fallido' ? 0 : 0.98);
  const confianza = Number(rawConf) > 1 ? Number(rawConf) / 100 : Number(rawConf);
  const categoriaConfianza = Math.round(confianza * 100);

  // Metadatos extraídos como mapa de campos clave-valor
  const campos = { ...(rawDoc.campos || {}) };
  if (Array.isArray(rawDoc.extracted_metadata)) {
    rawDoc.extracted_metadata.forEach((m) => {
      if (m.field_name && m.field_value !== null && m.field_value !== undefined && m.field_value !== '') {
        campos[m.field_name] = String(m.field_value);
      }
    });
  }

  // URL del documento en el bucket DocumentosIA de Supabase
  const ext = (rawDoc.file_name || rawDoc.nombre || '').split('.').pop() || 'pdf';
  const fallbackStorageUrl = rawDoc.id
    ? `https://ltukivbdvxlrszjcqqfw.supabase.co/storage/v1/object/public/DocumentosIA/${rawDoc.id}.${ext}`
    : null;
  const storageUrl = rawDoc.storage_url || rawDoc.storageUrl || fallbackStorageUrl;

  const correoDerivacion = rawDoc.correoDerivacion || getDestinationEmail(tipoDocumento, area);

  return {
    ...rawDoc,
    id: rawDoc.id,
    nombre: rawDoc.file_name || rawDoc.nombre || 'documento.pdf',
    fileName: rawDoc.file_name || rawDoc.nombre || 'documento.pdf',
    tipoDocumento,
    area,
    estado,
    confianza,
    categoriaConfianza,
    fecha,
    hora,
    campos,
    resumenEjecutivo: rawDoc.resumenEjecutivo || analysis?.ai_summary || '',
    resumen:
      rawDoc.resumen ||
      analysis?.ai_summary ||
      (estado === 'Fallido'
        ? 'El archivo no pudo ser procesado o no contiene texto legible.'
        : `Documento clasificado automáticamente como ${tipoDocumento} en área ${area}.`),
    informeEjecutivo: rawDoc.informeEjecutivo || null,
    derivacion: rawDoc.derivacion || `Derivado a ${area}`,
    correoDerivacion,
    storageUrl,
    descargaUrl: storageUrl || '#',
  };
}

export async function getDocuments() {
  const response = await fetch(`${API_URL}/documents`);
  if (!response.ok) throw new Error(`Error ${response.status}`);
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map(normalizeDocument);
}

export async function searchDocuments(query) {
  const response = await fetch(`${API_URL}/documents/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error(`Error ${response.status}`);
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map(normalizeDocument);
}

export async function getDocumentById(id) {
  const response = await fetch(`${API_URL}/documents/${id}`);
  if (!response.ok) throw new Error(`Error ${response.status}`);
  const data = await response.json();
  return normalizeDocument(data);
}

// ==========================================
// CHAT CON OLLAMA (Streaming)
// ==========================================
export async function* chatStream(message, history = []) {
  const response = await fetch(`${API_URL}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status} al conectar con el chat`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No se recibió cuerpo de respuesta del servidor');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue;
        try {
          const chunk = JSON.parse(line.slice(6));
          yield chunk; // ✅ Ahora funciona porque es "async function*"
        } catch (e) {
          console.warn('Error al parsear chunk del chat:', e);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}