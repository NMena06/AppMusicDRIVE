import { FileText, Guitar, Heart, PlaySquare, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DocumentCard } from '../components/DocumentCard.jsx';
import { useDocuments } from '../hooks/useDocuments.js';

const TYPE_META = {
  video: { label: 'Videos', icon: PlaySquare },
  'guitar-pro': { label: 'Guitar Pro', icon: Guitar },
  pdf: { label: 'PDFs', icon: FileText },
};

export function FavoritesPage() {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('');
  const { documents, setDocuments, loading, error } = useDocuments({ favorite: 'true', sort: 'nombre' });

  const counts = useMemo(() => documents.reduce((map, document) => {
    const key = document.tipo_documento || 'pdf';
    map[key] = (map[key] || 0) + 1;
    return map;
  }, {}), [documents]);

  const visibleDocuments = useMemo(() => {
    const value = search.trim().toLowerCase();
    return documents.filter((document) => {
      const matchesType = !activeType || document.tipo_documento === activeType;
      const searchable = `${document.titulo} ${document.descripcion || ''} ${document.seccion || ''} ${document.subcarpeta || ''}`.toLowerCase();
      return matchesType && (!value || searchable.includes(value));
    });
  }, [activeType, documents, search]);

  function patchDocument(changed) {
    setDocuments((current) => current.map((item) => (item.id === changed.id ? changed : item)).filter((item) => item.esFavorito));
  }

  return (
    <section className="page favorites-page">
      <div className="favorites-hero">
        <div className="module-icon"><Heart size={24} /></div>
        <div>
          <span>Tu material marcado</span>
          <h2>Favoritos</h2>
          <p>Acceso rapido a las clases, PDFs y tablaturas que queres seguir practicando.</p>
        </div>
      </div>

      <div className="tabs-toolbar favorites-toolbar">
        <label className="search-box">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar favorito" />
        </label>
        <div className="section-tabs compact-tabs">
          <button className={!activeType ? 'active' : ''} onClick={() => setActiveType('')} type="button">
            Todo <span>{documents.length}</span>
          </button>
          {Object.entries(TYPE_META).map(([type, meta]) => (
            <button key={type} className={activeType === type ? 'active' : ''} onClick={() => setActiveType(type)} type="button">
              {meta.label} <span>{counts[type] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="empty-state">Cargando favoritos...</div>}
      {error && <div className="empty-state">{error}</div>}
      {!loading && !error && visibleDocuments.length === 0 && (
        <div className="favorites-empty">
          <Heart size={34} />
          <strong>No hay favoritos todavia</strong>
          <p>Marca videos, PDFs o tablaturas con el corazon para construir tu lista de practica.</p>
        </div>
      )}
      {!loading && !error && visibleDocuments.length > 0 && (
        <div className="document-grid tabs-document-grid study-document-grid">
          {visibleDocuments.map((document) => (
            <DocumentCard key={document.id} document={document} onChange={patchDocument} />
          ))}
        </div>
      )}
    </section>
  );
}
