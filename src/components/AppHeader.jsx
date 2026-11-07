import { useEffect, useRef, useState } from 'react';
import NotificationPanel from './NotificationPanel';

export default function AppHeader({
  onLogoClick = () => {},
  notificaciones = [],
  onMarkAllRead = () => {},
  onClearNotifications = () => {},
  currentAccount = null,
  onAccountClick = () => {},
  onLogout = () => {},
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const panelRef = useRef(null);
  const accountRef = useRef(null);

  const noLeidas = notificaciones.filter((n) => !n.leido).length;

  useEffect(() => {
    const handler = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setPanelOpen(false);
      }

      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);

    return () => document.removeEventListener('mousedown', handler);
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
        <span className="brand-text">Gestor Inteligente de Documentos</span>
      </button>

      <div className="d-flex align-items-center gap-1">
        <div className="position-relative" ref={panelRef}>
          <button
            type="button"
            className="header-icon-btn"
            onClick={togglePanel}
            aria-label="Notificaciones"
            aria-expanded={panelOpen}
          >
            <i className="bi bi-bell" />
            <span className="d-none d-sm-inline">Notificaciones</span>
            {noLeidas > 0 && <span className="notif-dot" />}
          </button>

          {panelOpen && (
            <NotificationPanel
              notificaciones={notificaciones}
              onMarkAllRead={onMarkAllRead}
              onClear={() => {
                onClearNotifications();
                setPanelOpen(false);
              }}
            />
          )}
        </div>

        <div className="position-relative" ref={accountRef}>
          <button
            type="button"
            className="header-icon-btn"
            onClick={() => {
              if (currentAccount) {
                setAccountMenuOpen((open) => !open);
              } else {
                onAccountClick();
              }
            }}
            aria-expanded={accountMenuOpen}
          >
            <i className="bi bi-person-circle" />
            <span className="d-none d-sm-inline">
              {currentAccount ? currentAccount.nombre : 'Mi Cuenta'}
            </span>
          </button>

          {currentAccount && accountMenuOpen && (
            <div className="account-dropdown">
              <div className="px-3 py-2">
                <div className="fw-semibold">{currentAccount.nombre}</div>
                <div className="small text-muted-soft">{currentAccount.correo}</div>
                <div className="small text-muted-soft">Área: {currentAccount.area}</div>
              </div>

              <hr className="my-1" />

              <button
                type="button"
                className="account-dropdown-item"
                onClick={() => {
                  setAccountMenuOpen(false);
                  onLogout();
                }}
              >
                <i className="bi bi-box-arrow-right me-2" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
