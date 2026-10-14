import { useCallback, useEffect, useRef, useState } from 'react';

export const CAMERA_MESSAGES = {
  unsupported:
    'Tu navegador no permite acceder a la cámara. Prueba con una versión actualizada de Chrome, Edge, Firefox o Safari.',
  insecure:
    'El acceso a la cámara requiere una conexión segura. Abre la aplicación desde una dirección https:// (o desde localhost).',
  denied: 'No pudimos acceder a la cámara. Habilita el permiso en tu navegador e inténtalo nuevamente.',
  'not-found': 'No encontramos ninguna cámara disponible en este dispositivo.',
  'in-use': 'La cámara está siendo usada por otra aplicación. Ciérrala e inténtalo nuevamente.',
  ended: 'La cámara se detuvo. Vuelve a activarla para continuar.',
  error: 'No se pudo iniciar la cámara. Inténtalo nuevamente.',
};

const NON_RETRYABLE = ['unsupported', 'insecure'];

const STATUS_BY_ERROR_NAME = {
  NotAllowedError: 'denied',
  PermissionDeniedError: 'denied',
  SecurityError: 'denied',
  NotFoundError: 'not-found',
  DevicesNotFoundError: 'not-found',
  NotReadableError: 'in-use',
  TrackStartError: 'in-use',
};

async function requestStream(facingMode) {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    });
  } catch (error) {
    if (error?.name === 'OverconstrainedError' || error?.name === 'ConstraintNotSatisfiedError') {
      return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }
    throw error;
  }
}

function buildFileName() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `captura_${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(
    d.getMinutes()
  )}${p(d.getSeconds())}.jpg`;
}

export function useCamera({ defaultFacingMode = 'environment' } = {}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const requestRef = useRef(0);
  const facingRef = useRef(defaultFacingMode);

  const [status, setStatus] = useState('idle');
  const [canSwitch, setCanSwitch] = useState(false);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const detectSwitchable = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCanSwitch(devices.filter((d) => d.kind === 'videoinput').length > 1);
    } catch {
      setCanSwitch(false);
    }
  }, []);

  const start = useCallback(
    async (facingMode) => {
      const mode = typeof facingMode === 'string' ? facingMode : facingRef.current;
      facingRef.current = mode;

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus(window.isSecureContext === false ? 'insecure' : 'unsupported');
        return;
      }

      const requestId = ++requestRef.current;
      releaseStream();
      setStatus('requesting');

      try {
        const stream = await requestStream(mode);

        if (requestId !== requestRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        stream.getVideoTracks()[0]?.addEventListener('ended', () => {
          if (streamRef.current === stream) {
            releaseStream();
            setStatus('ended');
          }
        });

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {});
        }
        if (requestId !== requestRef.current) return;

        setStatus('active');
        detectSwitchable();
      } catch (error) {
        if (requestId !== requestRef.current) return;
        setStatus(STATUS_BY_ERROR_NAME[error?.name] ?? 'error');
      }
    },
    [releaseStream, detectSwitchable]
  );

  const stop = useCallback(() => {
    requestRef.current += 1;
    releaseStream();
    setStatus('idle');
  }, [releaseStream]);

  const switchCamera = useCallback(
    () => start(facingRef.current === 'environment' ? 'user' : 'environment'),
    [start]
  );

  const capture = useCallback(
    () =>
      new Promise((resolve) => {
        const video = videoRef.current;
        if (!video || !video.videoWidth || !video.videoHeight) {
          resolve(null);
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) =>
            resolve(
              blob ? new File([blob], buildFileName(), { type: 'image/jpeg', lastModified: Date.now() }) : null
            ),
          'image/jpeg',
          0.92
        );
      }),
    []
  );

  useEffect(
    () => () => {
      requestRef.current += 1;
      releaseStream();
    },
    [releaseStream]
  );

  return {
    videoRef,
    status,
    errorMessage: CAMERA_MESSAGES[status] ?? null,
    canRetry: !NON_RETRYABLE.includes(status),
    isActive: status === 'active',
    isRequesting: status === 'requesting',
    canSwitch,
    start,
    stop,
    switchCamera,
    capture,
  };
}
