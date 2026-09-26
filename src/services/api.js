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

export async function getDocuments() {
  const response = await fetch(`${API_URL}/documents`);
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
}

export async function searchDocuments(query) {
  const response = await fetch(`${API_URL}/documents/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
}

export async function getDocumentById(id) {
  const response = await fetch(`${API_URL}/documents/${id}`);
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
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