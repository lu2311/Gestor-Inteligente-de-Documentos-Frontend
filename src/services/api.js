const API_URL = import.meta.env.VITE_API_URL;

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
