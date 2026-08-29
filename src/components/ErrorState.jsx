const SUGERENCIAS = [
  'Verifica que el archivo no supere los 10MB.',
  'Asegúrate de que el formato sea PDF, JPG, PNG o DOCX.',
  'Comprueba tu conexión a internet e inténtalo nuevamente.',
  'Si el problema persiste, contacta al equipo de soporte.',
];

export default function ErrorState({ fileName, onRetry, onGoHome }) {
  return (
    <div className="card-plain p-5 text-center mx-auto" style={{ maxWidth: 520 }}>
      <div className="error-icon-circle">
        <i className="bi bi-exclamation-triangle-fill" />
      </div>
      <h5 className="fw-bold mb-1">No se pudo procesar el documento</h5>
      {fileName && <div className="text-muted-soft small mb-3">{fileName}</div>}

      <div className="text-start bg-light rounded-3 p-3 mb-4">
        <div className="fw-semibold small mb-2">Esto puede ayudarte:</div>
        <ul className="text-muted-soft small mb-0 ps-3">
          {SUGERENCIAS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className="d-flex justify-content-center gap-2">
        <button type="button" className="btn btn-warning-soft" onClick={onRetry}>
          <i className="bi bi-arrow-clockwise me-1" />
          Reintentar
        </button>
        <button type="button" className="btn btn-light" onClick={onGoHome}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
