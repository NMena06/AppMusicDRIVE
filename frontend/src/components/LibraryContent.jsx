import { DocumentCard } from './DocumentCard.jsx';
import { DocumentList } from './DocumentList.jsx';

const SUBFOLDER_ORDER = ['Introduccion', 'Dia 1', 'Dia 2', 'Dia 3', 'Dia 4', 'Ejercicios extras', 'Tics and Tricks', 'Download', 'Carpeta principal', 'PDF principal'];

function sortSubfolders(a, b) {
  const indexA = SUBFOLDER_ORDER.indexOf(a);
  const indexB = SUBFOLDER_ORDER.indexOf(b);
  if (indexA !== -1 || indexB !== -1) {
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  }
  return a.localeCompare(b, undefined, { numeric: true });
}

export function LibraryContent({ groupedDocuments, nestedGroups, visibleSectionNames, viewMode, documents, onChange }) {
  if (viewMode === 'list') {
    return <DocumentList documents={documents} onChange={onChange} />;
  }

  return (
    <div className="library-groups">
      {visibleSectionNames.map((section) => (
        <section className="library-group" key={section}>
          <div className="group-heading">
            <div>
              <h3>{section}</h3>
              <p>{Object.keys(nestedGroups[section]).sort(sortSubfolders).join(' · ')}</p>
            </div>
            <span>{groupedDocuments[section].length} documentos</span>
          </div>
          <div className="subfolder-groups">
            {Object.keys(nestedGroups[section]).sort(sortSubfolders).map((subfolder) => (
              <div className="subfolder-group" key={`${section}-${subfolder}`}>
                <div className="subfolder-heading">
                  <h4>{subfolder}</h4>
                  <span>{nestedGroups[section][subfolder].length} documentos</span>
                </div>
                <div className="document-grid">
                  {nestedGroups[section][subfolder].map((document) => (
                    <DocumentCard key={document.id} document={document} onChange={onChange} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
