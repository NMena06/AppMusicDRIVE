import { ArrowLeft, ExternalLink, Maximize2 } from 'lucide-react';
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchDriveDocuments, getProgress, saveProgress, touchHistory } from '../services/driveService.js';

const AlphaTabViewer = lazy(() => import('../components/AlphaTabViewer.jsx').then((module) => ({ default: module.AlphaTabViewer })));

export function ViewerPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');
  const frameRef = useRef(null);
  const previewUrl = useMemo(() => doc?.previewUrl || `https://drive.google.com/file/d/${id}/preview`, [doc, id]);

  useEffect(() => {
    fetchDriveDocuments()
      .then((documents) => {
        const found = documents.find((item) => item.id === id);
        if (!found) throw new Error('Documento no encontrado en Google Drive');
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

  return (
    <section className="viewer-page">
      <div className="viewer-header">
        <Link className="button secondary" to="/biblioteca"><ArrowLeft size={17} /> Volver</Link>
        <div>
          <h2>{doc?.titulo || 'Documento'}</h2>
          <span>{doc?.categoria?.nombre || 'PDF'}</span>
        </div>
        {doc?.url_view && <a className="button secondary" href={doc.url_view} target="_blank" rel="noreferrer"><ExternalLink size={17} /> Drive</a>}
      </div>
      {error && <div className="empty-state">{error}</div>}
      {!error && doc?.tipo_documento === 'guitar-pro' && (
        <Suspense fallback={<div className="empty-state">Cargando lector Guitar Pro...</div>}>
          <AlphaTabViewer document={doc} />
        </Suspense>
      )}
      {!error && doc?.tipo_documento !== 'guitar-pro' && doc && (
        <div className="pdf-frame" ref={frameRef}>
          <div className="pdf-toolbar">
            <label className="page-memory">Última página<input type="number" min="1" defaultValue={getProgress(id)} onChange={handlePageInput} /></label>
            <button className="icon-button" onClick={toggleFullscreen} title="Pantalla completa">
              <Maximize2 size={18} />
            </button>
          </div>
          <iframe className="drive-preview" src={previewUrl} title={doc.titulo} allow="fullscreen" />
        </div>
      )}
    </section>
  );
}
