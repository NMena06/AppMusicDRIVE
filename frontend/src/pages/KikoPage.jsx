import { ChevronLeft, FileText, FolderOpen, Guitar, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DocumentCard } from '../components/DocumentCard.jsx';
import { useDocuments } from '../hooks/useDocuments.js';

const MODULE_ORDER = ['Introduccion', 'Dia 1', 'Dia 2', 'Dia 3', 'Dia 4', 'Ejercicios extras', 'Tics and Tricks', 'Download', 'Carpeta principal'];

function sortModules(a, b) {
  const indexA = MODULE_ORDER.indexOf(a);
  const indexB = MODULE_ORDER.indexOf(b);
  if (indexA !== -1 || indexB !== -1) {
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  }
  return a.localeCompare(b, undefined, { numeric: true });
}

function getModuleTone(index) {
  return ['warm', 'mint', 'violet', 'sky', 'rose'][index % 5];
}

function getModuleSummary(documents) {
  const pdfs = documents.filter((doc) => doc.tipo_documento === 'pdf').length;
  const tabs = documents.filter((doc) => doc.tipo_documento === 'guitar-pro').length;
  return { pdfs, tabs };
}

export function KikoPage() {
  const [activeModule, setActiveModule] = useState('');
  const [search, setSearch] = useState('');
  const { documents, setDocuments, loading, error } = useDocuments({ section: 'KIKO', sort: 'nombre' });

  const modules = useMemo(() => {
    const grouped = documents.reduce((groups, document) => {
      const key = document.subcarpeta || 'Carpeta principal';
      groups[key] = groups[key] || [];
      groups[key].push(document);
      return groups;
    }, {});

    return Object.keys(grouped)
      .sort(sortModules)
      .map((name, index) => ({
        name,
        documents: grouped[name],
        tone: getModuleTone(index),
        ...getModuleSummary(grouped[name]),
      }));
  }, [documents]);

  const selectedModule = modules.find((module) => module.name === activeModule);
  const visibleDocuments = useMemo(() => {
    const source = selectedModule?.documents || [];
    const value = search.trim().toLowerCase();
    if (!value) return source;
    return source.filter((document) => {
      const searchable = `${document.titulo} ${document.titulo_original || ''} ${document.descripcion || ''}`.toLowerCase();
      return searchable.includes(value);
    });
  }, [search, selectedModule]);

  function patchDocument(changed) {
    setDocuments((current) => current.map((item) => (item.id === changed.id ? changed : item)));
  }

  return (
    <section className="page kiko-page">
      <div className="kiko-hero">
        <div>
          <span>Biblioteca de practica</span>
          <h2>KIKO</h2>
          <p>Rutina organizada por dias. Entra a una carpeta y estudia solo el material de ese modulo.</p>
        </div>
        <div className="kiko-total">
          <strong>{documents.length}</strong>
          <span>materiales</span>
        </div>
      </div>

      {loading && <div className="empty-state">Cargando documentos...</div>}
      {error && <div className="empty-state">{error}</div>}

      {!loading && !error && !activeModule && (
        <div className="kiko-module-grid">
          {modules.map((module) => (
            <button className={`kiko-module ${module.tone}`} key={module.name} onClick={() => setActiveModule(module.name)}>
              <span className="module-icon"><FolderOpen size={22} /></span>
              <strong>{module.name}</strong>
              <span>{module.documents.length} documentos</span>
              <small>
                <FileText size={14} /> {module.pdfs}
                <Guitar size={14} /> {module.tabs}
              </small>
            </button>
          ))}
        </div>
      )}

      {!loading && !error && activeModule && (
        <div className="kiko-workspace">
          <div className="kiko-toolbar">
            <button className="button secondary" onClick={() => { setActiveModule(''); setSearch(''); }}>
              <ChevronLeft size={18} />
              Modulos
            </button>
            <label className="search-box kiko-search">
              <Search size={18} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Buscar en ${activeModule}`} />
            </label>
          </div>

          <div className="kiko-module-header">
            <div>
              <span>Carpeta seleccionada</span>
              <h3>{activeModule}</h3>
            </div>
            <strong>{visibleDocuments.length} resultados</strong>
          </div>

          {visibleDocuments.length === 0 && <div className="empty-state">No hay documentos para mostrar.</div>}
          {visibleDocuments.length > 0 && (
            <div className="document-grid kiko-document-grid">
              {visibleDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} onChange={patchDocument} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
