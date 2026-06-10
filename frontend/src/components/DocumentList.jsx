import { BookOpen, ExternalLink, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toggleFavorite as toggleLocalFavorite } from '../services/driveService.js';

export function DocumentList({ documents, onChange }) {
  async function toggleFavorite(document) {
    const esFavorito = toggleLocalFavorite(document.id);
    onChange?.({ ...document, esFavorito });
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Documento</th>
            <th>Categoría</th>
            <th>Tipo</th>
            <th>Carpeta principal</th>
            <th>Carpeta</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id}>
              <td>
                <strong>{document.titulo}</strong>
                {document.titulo_original && document.titulo_original !== document.titulo && <small className="table-subtitle">{document.titulo_original}</small>}
              </td>
              <td>{document.categoria?.nombre || 'Otros'}</td>
              <td>{document.tipo_documento === 'guitar-pro' ? `GP ${document.extension?.toUpperCase()}` : 'PDF'}</td>
              <td>{document.seccion || 'General'}</td>
              <td>{document.carpeta_ruta || document.carpeta_nombre || 'Principal'}</td>
              <td>{document.fecha_modificacion_drive ? new Date(document.fecha_modificacion_drive).toLocaleDateString() : '-'}</td>
              <td className="table-actions">
                <button className={document.esFavorito ? 'icon-button active' : 'icon-button'} onClick={() => toggleFavorite(document)} title="Favorito">
                  <Heart size={17} />
                </button>
                <Link className="icon-button" to={`/documentos/${document.id}`} title="Ver PDF">
                  <BookOpen size={17} />
                </Link>
                {document.url_view && (
                  <a className="icon-button" href={document.url_view} target="_blank" rel="noreferrer" title="Abrir en Drive">
                    <ExternalLink size={17} />
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
