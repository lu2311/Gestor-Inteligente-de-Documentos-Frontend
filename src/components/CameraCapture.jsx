import { useEffect, useId, useRef, useState } from 'react';
import { useCamera } from '../data/useCamera';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const formatSize = (bytes) =>
  `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

export default function CameraCapture({ onConfirm, onClose }) {
  const {
    videoRef,
    errorMessage,
    canRetry,
    isActive,
    canSwitch,
    start,
    switchCamera,
    capture,
  } = useCamera();

  const [photo, setPhoto] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [captureFailed, setCaptureFailed] = useState(false);

  // Estados del recorte
  const [cropping, setCropping] = useState(false);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [cropError, setCropError] = useState('');
  const [applyingCrop, setApplyingCrop] = useState(false);

  const dialogRef = useRef(null);
  const cropImageRef = useRef(null);
  const titleId = useId();

  // Iniciar cámara
  useEffect(() => {
    start();
  }, [start]);

  // Bloquear scroll del fondo
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  // Liberar URL temporal de la fotografía
  useEffect(() => {
    if (!photo) return undefined;

    return () => {
      URL.revokeObjectURL(photo.url);
    };
  }, [photo]);

  // Capturar foto
  const handleCapture = async () => {
    setCapturing(true);
    setCaptureFailed(false);

    try {
      const file = await capture();

      if (!file) {
        setCaptureFailed(true);
        return;
      }

      setPhoto({
        file,
        url: URL.createObjectURL(file),
      });
    } catch {
      setCaptureFailed(true);
    } finally {
      setCapturing(false);
    }
  };

  // Tomar otra fotografía
  const handleRetake = () => {
    setPhoto(null);
    setCaptureFailed(false);
    setCropping(false);
    setCrop(undefined);
    setCompletedCrop(null);
    setCropError('');
    setApplyingCrop(false);
  };

  // Abrir el editor de recorte
  const handleStartCrop = () => {
    setCrop({
      unit: '%',
      x: 10,
      y: 10,
      width: 80,
      height: 80,
    });

    setCompletedCrop(null);
    setCropError('');
    setCropping(true);
  };

  // Cancelar sin modificar la foto original
  const handleCancelCrop = () => {
    setCropping(false);
    setCrop(undefined);
    setCompletedCrop(null);
    setCropError('');
  };

  // Guardar el área de recorte seleccionada
  const handleCropComplete = (pixelCrop) => {
    setCompletedCrop(pixelCrop);
  };

  // Aplicar recorte a resolución original
  const handleApplyCrop = async () => {
    const image = cropImageRef.current;

    if (
      !image ||
      !completedCrop ||
      completedCrop.width <= 0 ||
      completedCrop.height <= 0
    ) {
      setCropError('Selecciona el área que deseas conservar.');
      return;
    }

    setApplyingCrop(true);
    setCropError('');

    try {
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const sx = Math.round(completedCrop.x * scaleX);
      const sy = Math.round(completedCrop.y * scaleY);
      const sw = Math.round(completedCrop.width * scaleX);
      const sh = Math.round(completedCrop.height * scaleY);

      if (sw <= 0 || sh <= 0) {
        throw new Error('El área de recorte no es válida.');
      }

      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;

      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('No se pudo crear el área de recorte.');
      }

      context.drawImage(
        image,
        sx,
        sy,
        sw,
        sh,
        0,
        0,
        sw,
        sh
      );

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) {
              resolve(result);
            } else {
              reject(new Error('No se pudo generar la imagen.'));
            }
          },
          'image/jpeg',
          0.92
        );
      });

      const croppedFile = new File(
        [blob],
        photo.file.name,
        {
          type: 'image/jpeg',
          lastModified: Date.now(),
        }
      );

      setPhoto({
        file: croppedFile,
        url: URL.createObjectURL(croppedFile),
      });

      setCropping(false);
      setCrop(undefined);
      setCompletedCrop(null);
    } catch {
      setCropError(
        'No se pudo recortar la imagen. Inténtalo nuevamente.'
      );
    } finally {
      setApplyingCrop(false);
    }
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

            {/* Encabezado */}
            <div className="modal-header camera-header">
              <div className="pe-2">
                <h2
                  className="modal-title h6 fw-bold mb-1"
                  id={titleId}
                >
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

            {/* Contenido */}
            <div className="modal-body camera-body">
              <div className="camera-stage">

                {/* Mantener el video montado */}
                <video
                  ref={videoRef}
                  className={`camera-media ${
                    isActive && !reviewing ? '' : 'is-hidden'
                  }`}
                  autoPlay
                  playsInline
                  muted
                />

                {/* Fotografía y editor */}
                {reviewing && (
                  cropping ? (
                    <div className="crop-container">
                      <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={handleCropComplete}
                        minWidth={30}
                        minHeight={30}
                        keepSelection
                      >
                        <img
                          ref={cropImageRef}
                          src={photo.url}
                          alt="Selecciona el área del documento que deseas conservar"
                          className="crop-image"
                        />
                      </ReactCrop>
                    </div>
                  ) : (
                    <img
                      className="camera-media"
                      src={photo.url}
                      alt="Vista previa de la foto capturada"
                    />
                  )
                )}

                {/* Cargando cámara */}
                {showLoader && (
                  <div className="camera-overlay">
                    <div
                      className="spinner-border text-light"
                      role="status"
                      aria-hidden="true"
                    />

                    <p className="camera-overlay-text">
                      Solicitando acceso a la cámara…
                    </p>
                  </div>
                )}

                {/* Error de cámara */}
                {showError && (
                  <div className="camera-overlay">
                    <span
                      className="camera-overlay-icon"
                      aria-hidden="true"
                    >
                      <i className="bi bi-camera" />
                    </span>

                    <p
                      className="camera-overlay-text"
                      role="alert"
                    >
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

              {/* Instrucciones del recorte */}
              {reviewing && cropping && (
                <p className="text-muted small mt-3 mb-0">
                  Arrastra los bordes o las esquinas del recuadro para
                  seleccionar la parte del documento que deseas conservar.
                </p>
              )}

              {/* Error al recortar */}
              {cropError && (
                <div
                  className="alert alert-danger mt-3 mb-0"
                  role="alert"
                >
                  {cropError}
                </div>
              )}

              {/* Confirmación de la foto */}
              {reviewing && !cropping && (
                <div
                  className="alert alert-success d-flex align-items-start gap-2 mt-3 mb-0 py-2 px-3"
                  role="status"
                >
                  <i
                    className="bi bi-check-circle-fill mt-1"
                    aria-hidden="true"
                  />

                  <div className="min-w-0">
                    <div className="fw-semibold">
                      ¡Foto capturada correctamente!
                    </div>

                    <div className="small text-break">
                      {photo.file.name} · {formatSize(photo.file.size)}.
                      {' '}Puedes recortarla antes de enviarla.
                    </div>
                  </div>
                </div>
              )}

              {/* Error al tomar la foto */}
              {captureFailed && (
                <div
                  className="alert alert-danger mt-3 mb-0 py-2 px-3 small"
                  role="alert"
                >
                  No se pudo tomar la foto. Espera a que la imagen cargue
                  e inténtalo de nuevo.
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="modal-footer camera-footer">
              {reviewing ? (
                cropping ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline-secondary flex-fill flex-sm-grow-0"
                      onClick={handleCancelCrop}
                      disabled={applyingCrop}
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary flex-fill flex-sm-grow-0"
                      onClick={handleApplyCrop}
                      disabled={
                        !completedCrop?.width ||
                        !completedCrop?.height ||
                        applyingCrop
                      }
                    >
                      {applyingCrop ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            aria-hidden="true"
                          />
                          Aplicando…
                        </>
                      ) : (
                        <>
                          <i
                            className="bi bi-crop me-2"
                            aria-hidden="true"
                          />
                          Aplicar recorte
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline-secondary flex-fill flex-sm-grow-0"
                      onClick={handleRetake}
                    >
                      <i
                        className="bi bi-arrow-counterclockwise me-2"
                        aria-hidden="true"
                      />
                      Tomar otra
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-primary flex-fill flex-sm-grow-0"
                      onClick={handleStartCrop}
                    >
                      <i
                        className="bi bi-crop me-2"
                        aria-hidden="true"
                      />
                      Recortar foto
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary flex-fill flex-sm-grow-0"
                      onClick={() => onConfirm(photo.file)}
                    >
                      <i
                        className="bi bi-check-lg me-2"
                        aria-hidden="true"
                      />
                      Usar esta foto
                    </button>
                  </>
                )
              ) : (
                <>
                  {canSwitch && isActive && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-sm-auto"
                      aria-label="Cambiar de cámara"
                      onClick={() => switchCamera()}
                    >
                      <i
                        className="bi bi-arrow-repeat"
                        aria-hidden="true"
                      />

                      <span className="d-none d-sm-inline ms-2">
                        Cambiar cámara
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary flex-fill flex-sm-grow-0"
                    disabled={!isActive || capturing}
                    onClick={handleCapture}
                  >
                    {capturing ? (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />
                    ) : (
                      <i
                        className="bi bi-camera me-2"
                        aria-hidden="true"
                      />
                    )}

                    {capturing ? 'Capturando…' : 'Tomar foto'}
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