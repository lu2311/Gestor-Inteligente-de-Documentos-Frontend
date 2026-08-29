import { useRef, useState } from 'react';

function formatSize(bytes) {
  if (!bytes) return '0 MB';
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Dropzone({ file, onFileSelected, onRemoveFile }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileSelected({ nombre: dropped.name, size: formatSize(dropped.size) });
  };

  const handleChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) onFileSelected({ nombre: selected.name, size: formatSize(selected.size) });
  };

  if (file) {
    return (
      <div className="dropzone d-flex flex-column align-items-center" style={{ cursor: 'default' }}>
        <div className="file-preview">
          <span className="file-icon">
            <i className="bi bi-file-earmark-text" />
          </span>
          <div className="text-start">
            <div className="fw-semibold">{file.nombre}</div>
            <div className="text-muted-soft small">{file.size}</div>
          </div>
          <button type="button" className="remove-file-btn" onClick={onRemoveFile} aria-label="Eliminar archivo">
            <i className="bi bi-x" />
          </button>
        </div>
        <div className="text-muted-soft small mt-3 d-flex align-items-center gap-2">
          <i className="bi bi-info-circle text-primary" />
          Listo para clasificar con IA
        </div>
      </div>
    );
  }

  return (
    <div
      className={`dropzone ${dragging ? 'dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
    >
      <input ref={inputRef} type="file" className="d-none" accept=".pdf,.docx,image/*" onChange={handleChange} />
      <i className="bi bi-cloud-arrow-up cloud-icon d-block mb-3" />
      <div className="fw-semibold">Arrastra tus archivos aquí o haz clic para explorar</div>
      <div className="text-muted-soft small mt-1">Soporta PDF, JPG, PNG y DOCX (Máx. 10MB)</div>
    </div>
  );
}
