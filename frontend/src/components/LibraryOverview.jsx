import { BookOpen, FileText, Guitar, Heart, PlaySquare } from 'lucide-react';

export function LibraryOverview({ documents, filteredCount }) {
  const total = documents.length;
  const pdfs = documents.filter((doc) => doc.tipo_documento === 'pdf').length;
  const tabs = documents.filter((doc) => doc.tipo_documento === 'guitar-pro').length;
  const videos = documents.filter((doc) => doc.tipo_documento === 'video').length;
  const favorites = documents.filter((doc) => doc.esFavorito).length;

  return (
    <div className="library-overview">
      <div className="overview-card">
        <BookOpen size={20} />
        <span>Vista actual</span>
        <strong>{filteredCount}</strong>
      </div>
      <div className="overview-card">
        <FileText size={20} />
        <span>PDFs</span>
        <strong>{pdfs}</strong>
      </div>
      <div className="overview-card">
        <Guitar size={20} />
        <span>Tabs GP</span>
        <strong>{tabs}</strong>
      </div>
      <div className="overview-card">
        <Heart size={20} />
        <span>Favoritos</span>
        <strong>{favorites}</strong>
      </div>
      <div className="overview-card">
        <PlaySquare size={20} />
        <span>Videos</span>
        <strong>{videos}</strong>
      </div>
    </div>
  );
}
