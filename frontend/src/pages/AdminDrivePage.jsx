import { FolderSync } from 'lucide-react';
import { useState } from 'react';
import { DRIVE_COLLECTIONS, DRIVE_FOLDER_ID, fetchDriveDocuments, getDriveWarnings } from '../services/driveService.js';

export function AdminDrivePage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function syncDrive() {
    setSyncing(true);
    setError('');
    try {
      const data = await fetchDriveDocuments({ forceRefresh: true });
      setResult({
        total: data.length,
        folders: [...new Set(data.map((doc) => doc.carpeta_nombre))].length,
        collections: [...new Set(data.flatMap((doc) => (doc.coleccion || '').split(', ')))].filter(Boolean).length,
        warnings: getDriveWarnings(),
      });
    } catch (err) {
      setError(err.message || 'No se pudo leer Google Drive');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <section className="page">
      <div className="admin-band">
        <FolderSync size={34} />
        <div>
        <h2>Configuración de Google Drive</h2>
          <p>Carpeta principal: {DRIVE_FOLDER_ID}</p>
        </div>
        <button className="button primary" onClick={syncDrive} disabled={syncing}>
          {syncing ? 'Leyendo...' : 'Probar lectura'}
        </button>
      </div>
      {error && <div className="empty-state">{error}</div>}
      {result && (
        <div className="result-grid">
          <div><span>Colecciones</span><strong>{result.collections}</strong></div>
          <div><span>Carpetas</span><strong>{result.folders}</strong></div>
          <div><span>Total PDFs</span><strong>{result.total}</strong></div>
        </div>
      )}
      {result?.warnings?.length > 0 && (
        <div className="empty-state warning-state">
          Algunas rutas fueron omitidas por permisos o ID incorrecto: {result.warnings.map((warning) => `${warning.folderPath} (${warning.status})`).join(', ')}
        </div>
      )}
      <div className="section-title">
        <h2>Rutas cargadas</h2>
        <p>La app recorre estas carpetas y elimina duplicados automáticamente.</p>
      </div>
      <div className="document-grid">
        {DRIVE_COLLECTIONS.map((collection) => (
          <article className="mini-doc" key={collection.id}>
            <strong>{collection.path}</strong>
            <span>{collection.description}</span>
            <small>{collection.id}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
