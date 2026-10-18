import { useEffect, useId, useRef, useState } from 'react';
import { useCamera } from '../data/useCamera';

const formatSize = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

/**
 * Modal para registrar un documento con la cámara del dispositivo.
 *
 * Flujo: vista en vivo -> "Tomar foto" -> vista previa + mensaje de confirmación
 * -> "Usar esta foto" (llama a onConfirm con un File JPEG) o "Tomar otra".
 *
 * En pantallas < 576px ocupa toda la pantalla (modal-fullscreen-sm-down).
 * Se monta solo cuando está abierto: al desmontarse libera la cámara.
 */
export default function CameraCapture({ onConfirm, onClose }) {
  const { videoRef, errorMessage, canRetry, isActive, canSwitch, start, switchCamera, capture } =
    useCamera();

  const [photo, setPhoto] = useState(null); // { file, url }
  const [capturing, setCapturing] = useState(false);
  const [captureFailed, setCaptureFailed] = useState(false);
  const dialogRef = useRef(null);
  const titleId = useId();

  // Pide la cámara al abrir. (La liberación al cerrar la hace el propio hook.)
  useEffect(() => {
    start();
  }, [start]);

  // Bloquea el scroll del fondo mientras el modal está abierto y le da el foco.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Libera la URL temporal de la vista previa cuando cambia o se cierra el modal.
  useEffect(() => {
    if (!photo) return undefined;
    return () => URL.revokeObjectURL(photo.url);
  }, [photo]);

  const handleCapture = async () => {
    setCapturing(true);
    setCaptureFailed(false);
    const file = await capture();
    setCapturing(false);
    if (!file) {
      setCaptureFailed(true);
      return;
    }
    setPhoto({ file, url: URL.createObjectURL(file) });
  };

  const handleRetake = () => {
    setPhoto(null);
    setCaptureFailed(false);
  };

  const reviewing = Boolean(photo);
  const showError = !reviewing && Boolean(errorMessage);
  const showLoader = !reviewing && !errorMessage && !isActive;

  return (
    <>
      <div className="modal-backdrop show camera-backdrop" />
      <div
        ref={dialogRef}
        className="modal d-block camera-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
          <div className="modal-content camera-content">
            <div className="modal-header camera-header">
              <div className="pe-2">
                <h2 className="modal-title h6 fw-bold mb-1" id={titleId}>
                  Registrar documento con cámara
                </h2>
                <p className="text-muted-soft small mb-0">
                  Ubica el documento completo dentro del encuadre.
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar cámara"
                onClick={onClose}
              />
            </div>

            <div className="modal-body camera-body">
              <div className="camera-stage">
                {/* El <video> siempre está montado para que el hook pueda enlazar el stream. */}
                <video
                  ref={videoRef}
                  className={`camera-media ${isActive && !reviewing ? '' : 'is-hidden'}`}
                  autoPlay
                  playsInline
                  muted
                />

                {reviewing && (
                  <img
                    className="camera-media"
                    src={photo.url}
                    alt="Vista previa de la foto capturada"
                  />
                )}

                {showLoader && (
                  <div className="camera-overlay">
                    <div className="spinner-border text-light" role="status" aria-hidden="true" />
                    <p className="camera-overlay-text">Solicitando acceso a la cámara…</p>
                  </div>
                )}

                {showError && (
                  <div className="camera-overlay">
                    <span className="camera-overlay-icon" aria-hidden="true">
                      <i className="bi bi-camera" />
                    </span>
                    <p className="camera-overlay-text" role="alert">
                      {errorMessage}
                    </p>
                    {canRetry && (
                      <button
                        type="button"
                        className="btn btn-light btn-sm fw-semibold text-primary"
                        onClick={() => start()}
                      >
                        Intentar de nuevo
                      </button>
                    )}
                  </div>
                )}
              </div>

              {reviewing && (
                <div
                  className="alert alert-success d-flex align-items-start gap-2 mt-3 mb-0 py-2 px-3"
                  role="status"
                >
                  <i className="bi bi-check-circle-fill mt-1" aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="fw-semibold">¡Foto capturada correctamente!</div>
                    <div className="small text-break">
                      {photo.file.name} · {formatSize(photo.file.size)}. ¿Quieres usarla para
                      clasificar el documento?
                    </div>
                  </div>
                </div>
              )}

              {captureFailed && (
                <div className="alert alert-danger mt-3 mb-0 py-2 px-3 small" role="alert">
                  No se pudo tomar la foto. Espera a que la imagen cargue e inténtalo de nuevo.
                </div>
              )}
            </div>

            <div className="modal-footer camera-footer">
              {reviewing ? (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-secondary flex-fill flex-sm-grow-0"
                    onClick={handleRetake}
                  >
                    <i className="bi bi-arrow-counterclockwise me-2" aria-hidden="true" />
                    Tomar otra
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary flex-fill flex-sm-grow-0"
                    onClick={() => onConfirm(photo.file)}
                  >
                    <i className="bi bi-check-lg me-2" aria-hidden="true" />
                    Usar esta foto
                  </button>
                </>
              ) : (
                <>
                  {canSwitch && isActive && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-sm-auto"
                      aria-label="Cambiar de cámara"
                      onClick={() => switchCamera()}
                    >
                      <i className="bi bi-arrow-repeat" aria-hidden="true" />
                      <span className="d-none d-sm-inline ms-2">Cambiar cámara</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary flex-fill flex-sm-grow-0"
                    disabled={!isActive || capturing}
                    onClick={handleCapture}
                  >
                    {capturing ? (
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                    ) : (
                      <i className="bi bi-camera me-2" aria-hidden="true" />
                    )}
                    Tomar foto
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
