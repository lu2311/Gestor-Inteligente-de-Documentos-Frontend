export default function DerivationStatusCard({ correo }) {
  return (
    <div className="derivation-box mb-4">
      <div className="text-muted-soft small text-uppercase fw-semibold mb-2" style={{ letterSpacing: '0.03em' }}>
        Derivación automática (RPA)
      </div>
      {correo ? (
        <>
          <div className="d-flex align-items-center gap-2 fw-semibold" style={{ color: 'var(--green)' }}>
            <i className="bi bi-envelope-check" />
            Correo enviado a {correo}
          </div>
          <div className="text-muted-soft small mt-1">
            El documento fue derivado automáticamente al área correspondiente.
          </div>
        </>
      ) : (
        <div className="text-muted-soft small">
          No se pudo derivar el documento automáticamente. Requiere revisión manual.
        </div>
      )}
    </div>
  );
}
