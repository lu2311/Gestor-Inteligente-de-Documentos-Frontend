import { useMemo, useState } from 'react';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import HistorialTable from '../components/HistorialTable';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 6;

export default function HistorialPage({ documentos, onBack, onVerDocumento }) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [page, setPage] = useState(1);

  const filtrados = useMemo(() => {
    return documentos.filter((doc) => {
      const matchesSearch =
        doc.nombre.toLowerCase().includes(search.toLowerCase()) ||
        doc.area.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === 'Todos' ||
        (activeFilter === 'Fallidos' ? doc.estado === 'Fallido' : doc.area === activeFilter);
      return matchesSearch && matchesFilter;
    });
  }, [documentos, search, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginados = filtrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <button type="button" className="btn btn-link text-muted-soft text-decoration-none p-0" onClick={onBack}>
          ← Volver
        </button>
        <span className="text-muted-soft">/</span>
        <h5 className="fw-bold mb-0">Historial de Documentos</h5>
        <span className="text-muted-soft small ms-auto">{documentos.length} documentos</span>
      </div>

      <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
      <FilterChips documentos={documentos} activeFilter={activeFilter} onChange={(f) => { setActiveFilter(f); setPage(1); }} />

      <div className="card-plain p-3">
        <HistorialTable documentos={paginados} onVerDocumento={onVerDocumento} />
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
