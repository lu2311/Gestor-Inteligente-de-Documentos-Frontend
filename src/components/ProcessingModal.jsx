import { useEffect, useState } from 'react';
import { PROCESSING_STEPS } from '../data/mockDocuments';

/**
 * Avanza automáticamente por PROCESSING_STEPS (1s por paso) y llama a onComplete
 * cuando termina el último paso. Se usa como overlay sobre la pantalla de subida.
 */
export default function ProcessingModal({ onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (stepIndex >= PROCESSING_STEPS.length - 1) {
      const finishTimer = setTimeout(onComplete, 900);
      return () => clearTimeout(finishTimer);
    }
    const timer = setTimeout(() => setStepIndex((i) => i + 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  const progressPct = Math.round(((stepIndex + 1) / PROCESSING_STEPS.length) * 100);

  return (
    <div className="processing-overlay">
      <div className="processing-card">
        <div className="spinner-ring" />
        <h6 className="fw-bold mb-1">Procesando documento</h6>
        <div className="text-muted-soft small">{PROCESSING_STEPS[stepIndex]}</div>
        <div className="processing-progress">
          <div className="processing-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="text-muted-soft small mt-2 text-mono">{progressPct}%</div>
      </div>
    </div>
  );
}
