import CategoryBadge from './CategoryBadge';

export default function CategoryConfidenceCard({ area, confianza }) {
  return (
    <div className="card-plain p-3 mb-3">
      <div className="text-muted-soft small text-uppercase fw-semibold mb-2" style={{ letterSpacing: '0.03em' }}>
        Categoría detectada por IA
      </div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <CategoryBadge area={area} size="lg" />
        <div className="text-end">
          <div className="text-muted-soft small">Confianza</div>
          <div className="fw-bold" style={{ color: 'var(--green)' }}>{confianza}%</div>
        </div>
      </div>
      <div className="confidence-track">
        <div className="confidence-fill" style={{ width: `${confianza}%` }} />
      </div>
    </div>
  );
}
