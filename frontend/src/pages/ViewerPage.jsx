import { ArrowLeft, BookOpen, ExternalLink, Maximize2 } from 'lucide-react';
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchDriveDocuments, getProgress, saveProgress, touchHistory } from '../services/driveService.js';

const AlphaTabViewer = lazy(() => import('../components/AlphaTabViewer.jsx').then((module) => ({ default: module.AlphaTabViewer })));

export function ViewerPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [allDocuments, setAllDocuments] = useState([]);
  const [error, setError] = useState('');
  const frameRef = useRef(null);
  const previewUrl = useMemo(() => doc?.previewUrl || `https://drive.google.com/file/d/${id}/preview`, [doc, id]);

  useEffect(() => {
    fetchDriveDocuments()
      .then((documents) => {
        const found = documents.find((item) => item.id === id);
        if (!found) throw new Error('Documento no encontrado en Google Drive');
        setAllDocuments(documents);
        setDoc(found);
        touchHistory(found, getProgress(id));
      })
      .catch((err) => setError(err.message || 'No se pudo abrir el documento'));
  }, [id]);

  function toggleFullscreen() {
    if (!document.fullscreenElement) frameRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  function handlePageInput(event) {
    const page = Number(event.target.value || 1);
    saveProgress(id, page);
    if (doc) touchHistory(doc, page);
  }

  const isGuitarPro = doc?.tipo_documento === 'guitar-pro';
  const isVideo = doc?.tipo_documento === 'video';
  const relatedPdfs = useMemo(() => {
    if (!doc || !isVideo) return [];
    return allDocuments.filter((item) => {
      if (item.id === doc.id || item.tipo_documento !== 'pdf') return false;
      return item.carpeta_drive_id === doc.carpeta_drive_id || item.carpeta_ruta === doc.carpeta_ruta;
    });
  }, [allDocuments, doc, isVideo]);

  return (
    <section className={isGuitarPro ? 'viewer-page guitar-pro-viewer' : 'viewer-page'}>
      <div className="viewer-header compact">
        <Link className="icon-button" to="/biblioteca" title="Volver"><ArrowLeft size={18} /></Link>
        <div>
          <h2>{doc?.titulo || 'Documento'}</h2>
          <span>{doc?.categoria?.nombre || (isGuitarPro ? 'Guitar Pro' : isVideo ? 'Video' : 'PDF')}</span>
        </div>
        <div className="viewer-actions">
          {!isGuitarPro && !isVideo && (
            <label className="page-memory compact-memory">
              Pagina
              <input type="number" min="1" defaultValue={getProgress(id)} onChange={handlePageInput} />
            </label>
          )}
          {!isGuitarPro && (
            <button className="icon-button" onClick={toggleFullscreen} title="Pantalla completa">
              <Maximize2 size={18} />
            </button>
          )}
          {doc?.url_view && (
            <a className="icon-button" href={doc.url_view} target="_blank" rel="noreferrer" title="Abrir en Drive">
              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </div>

      {error && <div className="empty-state">{error}</div>}
      {!error && isGuitarPro && (
        <Suspense fallback={<div className="empty-state">Cargando lector Guitar Pro...</div>}>
          <AlphaTabViewer document={doc} />
        </Suspense>
      )}
      {!error && isVideo && doc && (
        <div className="video-frame" ref={frameRef}>
          <div className="video-stage">
            <video className="video-player" src={doc.mediaUrl} controls playsInline poster={doc.thumbnailUrl || ''} />
          </div>
          {relatedPdfs.length > 0 && (
            <aside className="related-materials">
              <span>Material de la misma carpeta</span>
              <div>
                {relatedPdfs.map((item) => (
                  <Link className="related-material" key={item.id} to={`/documentos/${item.id}`}>
                    <BookOpen size={17} />
                    <strong>{item.titulo}</strong>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>
      )}
      {!error && !isGuitarPro && !isVideo && doc && (
        <div className="pdf-frame" ref={frameRef}>
          <iframe className="drive-preview" src={previewUrl} title={doc.titulo} allow="fullscreen" />
        </div>
      )}
    </section>
  );
}
