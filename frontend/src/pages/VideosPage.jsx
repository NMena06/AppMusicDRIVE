import { PlaySquare, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DocumentCard } from '../components/DocumentCard.jsx';
import { useDocuments } from '../hooks/useDocuments.js';

const SECTION_ORDER = ['Matheus Asato', 'Leandro Celleri', 'KIKO', 'Nick Johnston', 'Libros', 'Libros y canciones', 'PDF sueltos', 'General'];

function sortSections(a, b) {
  const indexA = SECTION_ORDER.indexOf(a);
  const indexB = SECTION_ORDER.indexOf(b);
  if (indexA !== -1 || indexB !== -1) {
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  }
  return a.localeCompare(b, undefined, { numeric: true });
}

export function VideosPage() {
  const [activeSection, setActiveSection] = useState('');
  const [search, setSearch] = useState('');
  const { documents, setDocuments, loading, error } = useDocuments({ type: 'video', sort: 'nombre' });

  const sections = useMemo(() => {
    const counts = documents.reduce((map, document) => {
      const key = document.seccion || 'General';
      map[key] = (map[key] || 0) + 1;
      return map;
    }, {});
    return Object.keys(counts).sort(sortSections).map((name) => ({ name, count: counts[name] }));
  }, [documents]);

  const visibleDocuments = useMemo(() => {
    const value = search.trim().toLowerCase();
    return documents.filter((document) => {
      const matchesSection = !activeSection || document.seccion === activeSection;
      const searchable = `${document.titulo} ${document.titulo_original || ''} ${document.descripcion || ''} ${document.seccion || ''} ${document.subcarpeta || ''}`.toLowerCase();
      const matchesSearch = !value || searchable.includes(value);
      return matchesSection && matchesSearch;
    });
  }, [activeSection, documents, search]);

  function patchDocument(changed) {
    setDocuments((current) => current.map((item) => (item.id === changed.id ? changed : item)));
  }

  return (
    <section className="page tabs-page videos-page">
      <div className="tabs-hero videos-hero">
        <div className="module-icon"><PlaySquare size={24} /></div>
        <div>
          <span>Clases y referencias</span>
          <h2>Videos</h2>
          <p>Clases de Drive organizadas por carpeta, listas para ver junto al material de estudio.</p>
        </div>
      </div>

      <div className="tabs-toolbar">
        <label className="search-box">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar video" />
        </label>
        <div className="section-tabs compact-tabs">
          <button className={!activeSection ? 'active' : ''} onClick={() => setActiveSection('')}>
            Todo <span>{documents.length}</span>
          </button>
          {sections.map((section) => (
            <button key={section.name} className={activeSection === section.name ? 'active' : ''} onClick={() => setActiveSection(section.name)}>
              {section.name} <span>{section.count}</span>
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="empty-state">Cargando videos...</div>}
      {error && <div className="empty-state">{error}</div>}
      {!loading && !error && visibleDocuments.length === 0 && <div className="empty-state">No hay videos para mostrar.</div>}
      {!loading && !error && visibleDocuments.length > 0 && (
        <div className="document-grid tabs-document-grid">
          {visibleDocuments.map((document) => (
            <DocumentCard key={document.id} document={document} onChange={patchDocument} />
          ))}
        </div>
      )}
    </section>
  );
}
