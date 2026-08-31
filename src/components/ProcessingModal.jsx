import { useEffect, useState } from 'react';

export default function ProcessingModal({ step }) {
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((current) => {
        if (current >= 90) return current;
        return current + 5;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="processing-overlay">
      <div className="processing-card">
        <div className="spinner-ring" />

        <h6 className="fw-bold mb-1">
          Procesando documento
        </h6>

        <div className="text-muted-soft small">
          {step}
        </div>

        <div className="processing-progress">
          <div
            className="processing-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-muted-soft small mt-2 text-mono">
          {progress}%
        </div>
      </div>
    </div>
  );
}
