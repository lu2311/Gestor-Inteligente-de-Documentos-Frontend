const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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