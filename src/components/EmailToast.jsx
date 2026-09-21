import { useEffect, useState } from 'react';
import { AREA_CONFIG } from '../data/mockDocuments';

/**
 * Se muestra al entrar a la pantalla de Resultados: simula el envío del correo
 * de derivación (RPA) al área detectada. Pasa por "sending" -> "sent" y avisa a
 * App vía onSent() para que quede registrado en el historial de notificaciones.
 */
export default function EmailToast({ archivo, area, correo, onSent, onClose }) {
  const [estado, setEstado] = useState('enviando');
  const config = AREA_CONFIG[area];

  useEffect(() => {
    const sendTimer = setTimeout(() => {
      setEstado('enviado');
      onSent();
    }, 2200);
    return () => clearTimeout(sendTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (estado === 'enviado') {
      const closeTimer = setTimeout(onClose, 5200);
      return () => clearTimeout(closeTimer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  return (
    <div className="email-toast">
      {estado === 'enviado' && (
        <div className="email-toast-progress">
          <div className="email-toast-progress-fill" />
        </div>
      )}
      <div className="p-3 d-flex gap-3 align-items-start">
        <span
          className="email-toast-icon"
          style={{ backgroundColor: estado === 'enviando' ? 'var(--blue-soft)' : 'var(--green-soft)' }}
        >
          {estado === 'enviando' ? (
            <span className="spinner-border spinner-border-sm" style={{ color: 'var(--blue)' }} />
          ) : (
            <i className="bi bi-check-circle-fill" style={{ color: 'var(--green)' }} />
          )}
        </span>
        <div className="flex-fill">
          <div className="d-flex justify-content-between align-items-start">
            <div className="fw-semibold small">
              {estado === 'enviando' ? 'Enviando correo...' : 'Correo enviado'}
            </div>
            <button type="button" className="btn-close btn-close-sm" style={{ fontSize: '0.65rem' }} onClick={onClose} />
          </div>
          {estado === 'enviando' ? (
            <div className="text-muted-soft small">Adjuntando <strong>{archivo}</strong> y preparando envío...</div>
          ) : (
            <>
              <div className="text-muted-soft small">
                <strong>{archivo}</strong> fue enviado a
              </div>
              <div className="small fw-semibold" style={{ color: config.text }}>
                <i className={`bi ${config.icon} me-1`} />
                {correo}
              </div>
              <div className="d-flex align-items-center gap-2 mt-2 pt-2 border-top">
                <span className="badge-soft" style={{ backgroundColor: config.bg, color: config.text }}>
                  <i className={`bi ${config.icon}`} />
                  Área {area}
                </span>
                <span className="text-muted-soft" style={{ fontSize: '0.72rem' }}>· hace un momento</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
