import { useEffect, useRef, useState } from 'react';
import NotificationPanel from './NotificationPanel';

export default function AppHeader({
  onLogoClick = () => { },
  notificaciones = [],
  onMarkAllRead = () => { },
  onClearNotifications = () => { },
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);

  const noLeidas = notificaciones.filter((n) => !n.leido).length;

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, []);

  const togglePanel = () => {
    setPanelOpen((open) => {
      if (!open) onMarkAllRead();
      return !open;
    });
  };

  return (
    <header className="app-header">
      <button type="button" className="brand" onClick={onLogoClick}>
        <i className="bi bi-file-earmark-text" />
        Gestor Inteligente de Documentos
      </button>

      <div className="d-flex align-items-center gap-1">
        <span className="ia-status-pill me-2">
          <span className="dot" />
          IA Activa
        </span>

        <div className="position-relative" ref={panelRef}>
          <button type="button" className="header-icon-btn" onClick={togglePanel}>
            <i className="bi bi-bell" />
            <span className="d-none d-sm-inline">Notificaciones</span>
            {noLeidas > 0 && <span className="notif-dot" />}
          </button>
          {panelOpen && (
            <NotificationPanel
              notificaciones={notificaciones}
              onMarkAllRead={onMarkAllRead}
              onClear={() => { onClearNotifications(); setPanelOpen(false); }}
            />
          )}
        </div>

        <span className="header-icon-btn">
          <i className="bi bi-person-circle" />
          <span className="d-none d-sm-inline">Mi Cuenta</span>
        </span>
      </div>
    </header>
  );
}