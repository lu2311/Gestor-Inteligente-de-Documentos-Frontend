export default function SearchBar({ value, onChange }) {
  return (
    <div className="d-flex align-items-center card-plain px-3 py-2 mb-3">
      <i className="bi bi-search text-muted-soft me-2" />
      <input
        type="text"
        className="form-control border-0 shadow-none p-0"
        placeholder="Buscar por nombre o categoría..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
