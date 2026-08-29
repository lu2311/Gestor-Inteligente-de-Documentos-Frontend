export default function SummaryBox({ resumen }) {
  return (
    <div className="summary-box mb-3">
      <div className="text-muted-soft small text-uppercase fw-semibold mb-2" style={{ letterSpacing: '0.03em' }}>
        Resumen ejecutivo (IA)
      </div>
      <p className="mb-0">{resumen}</p>
    </div>
  );
}
