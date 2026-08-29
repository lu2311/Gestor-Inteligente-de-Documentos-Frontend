export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="d-flex justify-content-center gap-2 mt-4">
      <button
        type="button"
        className="page-btn"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        «
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
        <button
          key={num}
          type="button"
          className={`page-btn ${page === num ? 'active' : ''}`}
          onClick={() => onChange(num)}
        >
          {num}
        </button>
      ))}
      <button
        type="button"
        className="page-btn"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        »
      </button>
    </div>
  );
}
