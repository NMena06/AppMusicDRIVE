import { CheckCircle2, ExternalLink, FileText, FolderOpen, Guitar, PlaySquare, Search, X } from 'lucide-react';
import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useDocuments } from '../hooks/useDocuments.js';
import { touchHistory } from '../services/driveService.js';

const AlphaTabViewer = lazy(() => import('../components/AlphaTabViewer.jsx').then((module) => ({ default: module.AlphaTabViewer })));

const MODULE_ORDER = ['Introduccion', 'Dia 1', 'Dia 2', 'Dia 3', 'Dia 4', 'Ejercicios extras', 'Tics and Tricks', 'Download', 'Carpeta principal'];

function sortModules(a, b) {
  const indexA = MODULE_ORDER.indexOf(a);
  const indexB = MODULE_ORDER.indexOf(b);
  if (indexA !== -1 || indexB !== -1) {
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  }
  return a.localeCompare(b, undefined, { numeric: true });
}

function getTypeCounts(documents) {
  return documents.reduce(
    (counts, document) => {
      if (document.tipo_documento === 'video') counts.videos += 1;
      else if (document.tipo_documento === 'guitar-pro') counts.tabs += 1;
      else counts.pdfs += 1;
      return counts;
    },
    { videos: 0, pdfs: 0, tabs: 0 },
  );
}

function getMaterialIcon(type) {
  if (type === 'video') return <PlaySquare size={18} />;
  if (type === 'guitar-pro') return <Guitar size={18} />;
  return <FileText size={18} />;
}

function getMaterialLabel(document) {
  if (document.tipo_documento === 'video') return 'Video';
  if (document.tipo_documento === 'guitar-pro') return `Tab ${document.extension?.toUpperCase() || 'GP'}`;
  return 'PDF';
}

function readViewedMaterials() {
  try {
    return JSON.parse(localStorage.getItem('kikoViewedMaterials')) || {};
  } catch {
    return {};
  }
}

function CourseInlineViewer({ document, onClose, onMarkViewed }) {
  if (!document) return null;

  return (
    <section className={`course-player ${document.tipo_documento}`}>
      <div className="course-player-header">
        <div>
          <span>{getMaterialLabel(document)}</span>
          <h4>{document.titulo}</h4>
        </div>
        <div className="course-player-actions">
          <button className="button secondary" onClick={onMarkViewed} type="button">
            <CheckCircle2 size={17} />
            Marcar visto
          </button>
          {document.url_view && (
            <a className="icon-button" href={document.url_view} target="_blank" rel="noreferrer" title="Abrir en Drive">
              <ExternalLink size={18} />
            </a>
          )}
          <button className="icon-button" onClick={onClose} title="Cerrar" type="button">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="course-player-body">
        {document.tipo_documento === 'video' && (
          <video className="course-video-player" src={document.mediaUrl} controls playsInline />
        )}
        {document.tipo_documento === 'pdf' && (
          <iframe className="course-pdf-player" src={document.previewUrl} title={document.titulo} allow="fullscreen" />
        )}
        {document.tipo_documento === 'guitar-pro' && (
          <Suspense fallback={<div className="empty-state">Cargando tablatura...</div>}>
            <AlphaTabViewer document={document} />
          </Suspense>
        )}
      </div>
    </section>
  );
}

export function KikoPage() {
  const [activeDocument, setActiveDocument] = useState(null);
  const [activeModule, setActiveModule] = useState('');
  const [search, setSearch] = useState('');
  const [viewedMaterials, setViewedMaterials] = useState(() => readViewedMaterials());
  const { documents, loading, error } = useDocuments({ section: 'KIKO', sort: 'nombre' });

  const modules = useMemo(() => {
    const grouped = documents.reduce((groups, document) => {
      const key = document.subcarpeta || 'Carpeta principal';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(document);
      return groups;
    }, new Map());

    return [...grouped.entries()]
      .map(([name, moduleDocuments]) => ({
        name,
        documents: [...moduleDocuments].sort((a, b) => {
          const typeOrder = { video: 0, pdf: 1, 'guitar-pro': 2 };
          return (typeOrder[a.tipo_documento] ?? 9) - (typeOrder[b.tipo_documento] ?? 9) || a.titulo.localeCompare(b.titulo);
        }),
        counts: getTypeCounts(moduleDocuments),
      }))
      .sort((a, b) => sortModules(a.name, b.name));
  }, [documents]);

  const visibleModules = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return modules;
    return modules
      .map((module) => ({
        ...module,
        documents: module.documents.filter((document) => {
          const searchable = `${document.titulo} ${document.titulo_original || ''} ${document.descripcion || ''}`.toLowerCase();
          return searchable.includes(value);
        }),
      }))
      .filter((module) => module.documents.length > 0);
  }, [modules, search]);

  const selectedModule = modules.find((module) => module.name === activeModule) || modules[0];
  const totalCounts = useMemo(() => getTypeCounts(documents), [documents]);

  useEffect(() => {
    if (!activeModule && modules.length > 0) {
      setActiveModule(modules[0].name);
    }
  }, [activeModule, modules]);

  useEffect(() => {
    if (!activeDocument || documents.some((document) => document.id === activeDocument.id)) return;
    setActiveDocument(null);
  }, [activeDocument, documents]);

  function openMaterial(document) {
    setActiveDocument(document);
    setActiveModule(document.subcarpeta || 'Carpeta principal');
    touchHistory(document);
  }

  function markViewed(document = activeDocument) {
    if (!document) return;
    setViewedMaterials((current) => {
      const next = { ...current, [document.id]: new Date().toISOString() };
      localStorage.setItem('kikoViewedMaterials', JSON.stringify(next));
      return next;
    });
  }

  return (
    <section className="page courses-page kiko-course-page">
      <div className="courses-hero">
        <div>
          <span>Curso de practica</span>
          <h2>KIKO</h2>
          <p>Rutina organizada por modulos. Abrí videos, PDFs y tablaturas sin salir del curso.</p>
        </div>
        <div className="course-stats">
          <span><PlaySquare size={16} /> {totalCounts.videos} videos</span>
          <span><FileText size={16} /> {totalCounts.pdfs} PDFs</span>
          <span><Guitar size={16} /> {totalCounts.tabs} tabs</span>
        </div>
      </div>

      {loading && <div className="empty-state">Cargando curso KIKO...</div>}
      {error && <div className="empty-state">{error}</div>}
      {!loading && !error && documents.length === 0 && <div className="empty-state">No hay materiales en KIKO.</div>}

      {!loading && !error && documents.length > 0 && (
        <div className="course-workspace kiko-course-workspace">
          <aside className="course-rail kiko-content-rail">
            <div className="course-rail-title">
              <span>Contenido</span>
              <strong>{modules.length}</strong>
            </div>

            <label className="search-box kiko-course-search">
              <Search size={17} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar en KIKO" />
            </label>

            {modules.map((module) => {
              const viewedCount = module.documents.filter((document) => viewedMaterials[document.id]).length;
              return (
                <button
                  className={selectedModule?.name === module.name ? 'course-tab active' : 'course-tab'}
                  key={module.name}
                  onClick={() => setActiveModule(module.name)}
                  type="button"
                >
                  <FolderOpen size={18} />
                  <span>
                    <strong>{module.name}</strong>
                    <small>{viewedCount}/{module.documents.length} vistos</small>
                  </span>
                </button>
              );
            })}
          </aside>

          <div className="course-detail">
            <div className="course-header">
              <div>
                <span>Curso seleccionado</span>
                <h3>KIKO</h3>
                <p>Contenido ordenado por Introduccion, Dia 1, Dia 2 y el resto de carpetas de practica.</p>
              </div>
              <div className="course-stats">
                <span><PlaySquare size={16} /> {totalCounts.videos} videos</span>
                <span><FileText size={16} /> {totalCounts.pdfs} PDFs</span>
                <span><Guitar size={16} /> {totalCounts.tabs} tabs</span>
              </div>
            </div>

            <CourseInlineViewer
              document={activeDocument}
              onClose={() => setActiveDocument(null)}
              onMarkViewed={() => markViewed(activeDocument)}
            />

            <div className="lesson-stack">
              {visibleModules.map((module) => (
                <article className={selectedModule?.name === module.name ? 'lesson-card active' : 'lesson-card'} key={module.name}>
                  <div className="lesson-heading">
                    <div>
                      <span>Modulo</span>
                      <h4>{module.name}</h4>
                    </div>
                    <strong>{module.documents.filter((document) => viewedMaterials[document.id]).length}/{module.documents.length} vistos</strong>
                  </div>

                  <div className="lesson-materials">
                    {module.documents.map((document) => (
                      <button
                        className={`lesson-material ${document.tipo_documento} ${activeDocument?.id === document.id ? 'active' : ''}`}
                        onClick={() => openMaterial(document)}
                        type="button"
                        key={document.id}
                      >
                        <span>{getMaterialIcon(document.tipo_documento)}</span>
                        <div>
                          <small>{getMaterialLabel(document)}</small>
                          <strong>{document.titulo}</strong>
                        </div>
                        {viewedMaterials[document.id] ? <CheckCircle2 size={17} /> : <small className="viewed-pill">Pendiente</small>}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
