import { BookOpen, Clock3, FolderSync, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDriveDocuments, getHistory } from '../services/driveService.js';

export function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchDriveDocuments().then((data) => setDocuments(data.slice(0, 6))).catch(() => setDocuments([]));
    setHistory(getHistory().slice(0, 5));
  }, []);

  return (
    <section className="page">
      <div className="metric-grid">
        <div className="metric"><BookOpen /><span>PDFs recientes</span><strong>{documents.length}</strong></div>
        <div className="metric"><Heart /><span>Favoritos</span><strong>{documents.filter((doc) => doc.esFavorito).length}</strong></div>
        <div className="metric"><Clock3 /><span>Últimos vistos</span><strong>{history.length}</strong></div>
        <Link className="metric action" to="/admin/drive"><FolderSync /><span>Fuente</span><strong>Drive</strong></Link>
      </div>
      <div className="section-title">
        <h2>Últimos documentos</h2>
        <p>Material listo para practicar</p>
      </div>
      <div className="document-grid">
        {documents.map((doc) => (
          <Link className="mini-doc" key={doc.id} to={`/documentos/${doc.id}`}>
            <strong>{doc.titulo}</strong>
            <span>{doc.categoria?.nombre || 'Otros'}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
