export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="brand">
        <i className="bi bi-file-earmark-text" />
        Gestor Inteligente de Documentos
      </div>
      <div className="d-flex align-items-center gap-3">
        <span className="ia-status-pill">
          <span className="dot" />
          IA Activa
        </span>
        <span className="d-flex align-items-center gap-2 text-muted-soft small">
          <i className="bi bi-person-circle" />
          Mi Cuenta
        </span>
      </div>
    </header>
  );
}
