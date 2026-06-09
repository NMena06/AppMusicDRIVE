import { BookOpen, ExternalLink, FileText, Guitar, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toggleFavorite as toggleLocalFavorite } from '../services/driveService.js';

export function DocumentCard({ document, onChange }) {
  async function toggleFavorite() {
    const esFavorito = toggleLocalFavorite(document.id);
    onChange?.({ ...document, esFavorito });
  }

  return (
    <article className="document-card">
      <div className="document-icon">
        {document.tipo_documento === 'guitar-pro' ? <Guitar size={28} /> : <FileText size={28} />}
      </div>
      <div className="document-body">
        <span className="chip">{document.tipo_documento === 'guitar-pro' ? 'Tablatura GP' : document.categoria?.nombre || 'Otros'}</span>
        <h3>{document.titulo}</h3>
        <strong className="section-label">{document.seccion || 'General'} / {document.subcarpeta || 'Carpeta principal'}</strong>
        <p>{document.descripcion || document.carpeta_ruta || document.carpeta_nombre || 'Carpeta principal'}</p>
        {document.titulo_original && document.titulo_original !== document.titulo && (
          <small className="original-name">{document.titulo_original}</small>
        )}
      </div>
      <div className="document-actions">
        <button className={document.esFavorito ? 'icon-button active' : 'icon-button'} onClick={toggleFavorite} title="Favorito">
          <Heart size={18} />
        </button>
        <Link className="button secondary" to={`/documentos/${document.id}`}>
          <BookOpen size={17} />
          {document.tipo_documento === 'guitar-pro' ? 'Ver tab' : 'Ver PDF'}
        </Link>
        {document.url_view && (
          <a className="icon-button" href={document.url_view} target="_blank" rel="noreferrer" title="Abrir en Drive">
            <ExternalLink size={18} />
          </a>
        )}
      </div>
    </article>
  );
}
