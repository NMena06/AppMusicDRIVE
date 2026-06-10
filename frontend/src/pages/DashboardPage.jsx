import { BookOpen, Clock3, FolderSync, Guitar, Heart, Library } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDriveDocuments, getHistory } from '../services/driveService.js';

export function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchDriveDocuments().then((data) => setDocuments(data)).catch(() => setDocuments([]));
    setHistory(getHistory().slice(0, 5));
  }, []);

  const recentDocuments = documents.slice(0, 6);
  const pdfCount = documents.filter((doc) => doc.tipo_documento === 'pdf').length;
  const tabCount = documents.filter((doc) => doc.tipo_documento === 'guitar-pro').length;
  const favoriteCount = documents.filter((doc) => doc.esFavorito).length;

  return (
    <section className="page">
      <div className="dashboard-hero">
        <div>
          <span>Biblioteca musical</span>
          <h2>Todo tu material listo para practicar.</h2>
          <p>Encontrá PDFs, tablaturas GP, favoritos y últimos vistos sin perder tiempo entre carpetas.</p>
        </div>
        <div className="hero-actions">
          <Link className="button primary" to="/biblioteca"><Library size={17} /> Abrir biblioteca</Link>
          <Link className="button secondary" to="/tabs"><Guitar size={17} /> Ver GP Tabs</Link>
        </div>
      </div>
      <div className="metric-grid">
        <div className="metric"><BookOpen /><span>PDFs</span><strong>{pdfCount}</strong></div>
        <div className="metric"><Guitar /><span>Tabs GP</span><strong>{tabCount}</strong></div>
        <div className="metric"><Heart /><span>Favoritos</span><strong>{favoriteCount}</strong></div>
        <div className="metric"><Clock3 /><span>Últimos vistos</span><strong>{history.length}</strong></div>
        <Link className="metric action" to="/admin/drive"><FolderSync /><span>Fuente</span><strong>Drive</strong></Link>
      </div>
      <div className="section-title">
        <h2>Últimos documentos</h2>
        <p>Material listo para practicar</p>
      </div>
      <div className="document-grid">
        {recentDocuments.map((doc) => (
          <Link className="mini-doc" key={doc.id} to={`/documentos/${doc.id}`}>
            <strong>{doc.titulo}</strong>
            <span>{doc.categoria?.nombre || 'Otros'}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
