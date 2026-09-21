import { AREA_CONFIG } from '../data/mockDocuments';

export default function NotificationPanel({ notificaciones, onMarkAllRead, onClear }) {
  const noLeidas = notificaciones.filter((n) => !n.leido).length;

  return (
    <div className="notif-panel">
      <div className="notif-panel-header">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-bold small">Notificaciones</span>
          {noLeidas > 0 && (
            <span className="badge rounded-pill" style={{ backgroundColor: 'var(--red)' }}>{noLeidas}</span>
          )}
        </div>
        <div className="d-flex gap-2">
          {noLeidas > 0 && (
            <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={onMarkAllRead}>
              Marcar todo leído
            </button>
          )}
          {notificaciones.length > 0 && (
            <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none text-muted-soft" onClick={onClear}>
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="notif-panel-body">
        {notificaciones.length === 0 ? (
          <div className="text-center text-muted-soft small py-4">
            <i className="bi bi-bell-slash fs-4 d-block mb-2" />
            Sin notificaciones aún
          </div>
        ) : (
          notificaciones.map((n) => {
            const config = AREA_CONFIG[n.area];
            return (
              <div className={`notif-row ${n.leido ? '' : 'unread'}`} key={n.id}>
                <span className="notif-icon" style={{ backgroundColor: config.bg, color: config.text }}>
                  <i className={`bi ${config.icon}`} />
                </span>
                <div className="flex-fill">
                  <div className="small fw-semibold">Correo enviado · Área {n.area}</div>
                  <div className="small">{n.archivo}</div>
                  <div className="d-flex align-items-center gap-2 text-muted-soft" style={{ fontSize: '0.75rem' }}>
                    <i className="bi bi-envelope-check" style={{ color: 'var(--green)' }} />
                    {n.correo}
                    <span>·</span>
                    <span>{n.hora}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
