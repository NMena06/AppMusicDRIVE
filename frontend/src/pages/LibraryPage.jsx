import { useEffect, useMemo, useState } from 'react';
import { FiltersBar } from '../components/FiltersBar.jsx';
import { LibraryContent } from '../components/LibraryContent.jsx';
import { LibraryContext } from '../components/LibraryContext.jsx';
import { LibraryOverview } from '../components/LibraryOverview.jsx';
import { SectionNavigator } from '../components/SectionNavigator.jsx';
import { useDocuments } from '../hooks/useDocuments.js';
import { getCategories } from '../services/driveService.js';

const SECTION_ORDER = ['KIKO', 'Nick Johnston', 'Libros', 'Libros y canciones', 'PDF sueltos', 'General'];

function sortSections(a, b) {
  const indexA = SECTION_ORDER.indexOf(a);
  const indexB = SECTION_ORDER.indexOf(b);
  if (indexA !== -1 || indexB !== -1) {
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  }
  return a.localeCompare(b);
}

export function LibraryPage({ favoriteOnly = false, lockedSection = '', lockedType = '', title, description }) {
  const [filters, setFilters] = useState({ sort: 'nombre', favorite: favoriteOnly ? 'true' : '', section: lockedSection, type: lockedType });
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const { documents, allDocuments, setDocuments, loading, error } = useDocuments(filters);
  const folders = useMemo(() => [...new Set(allDocuments.map((doc) => doc.carpeta_nombre).filter(Boolean))].sort(), [allDocuments]);
  const sections = useMemo(() => [...new Set(allDocuments.map((doc) => doc.seccion).filter(Boolean))].sort(sortSections), [allDocuments]);
  const categoryOptions = useMemo(() => {
    const detected = allDocuments.map((doc) => doc.categoria?.nombre).filter(Boolean);
    return [...new Map([...categories, ...detected.map((nombre) => ({ id: nombre, nombre, activo: true }))].map((category) => [category.nombre, category])).values()];
  }, [allDocuments, categories]);
  const groupedDocuments = useMemo(() => {
    return documents.reduce((groups, document) => {
      const key = document.seccion || 'General';
      groups[key] = groups[key] || [];
      groups[key].push(document);
      return groups;
    }, {});
  }, [documents]);
  const visibleSectionNames = useMemo(() => Object.keys(groupedDocuments).sort(sortSections), [groupedDocuments]);
  const nestedGroups = useMemo(() => {
    return visibleSectionNames.reduce((sectionsMap, section) => {
      sectionsMap[section] = groupedDocuments[section].reduce((subgroups, document) => {
        const key = document.subcarpeta || 'Carpeta principal';
        subgroups[key] = subgroups[key] || [];
        subgroups[key].push(document);
        return subgroups;
      }, {});
      return sectionsMap;
    }, {});
  }, [groupedDocuments, visibleSectionNames]);
  const sectionCounts = useMemo(() => {
    return allDocuments.reduce((counts, document) => {
      const key = document.seccion || 'General';
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
  }, [allDocuments]);

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  useEffect(() => {
    if (lockedSection && filters.section !== lockedSection) {
      setFilters((current) => ({ ...current, section: lockedSection }));
    }
  }, [lockedSection, filters.section]);

  useEffect(() => {
    if (lockedType && filters.type !== lockedType) {
      setFilters((current) => ({ ...current, type: lockedType }));
    }
  }, [lockedType, filters.type]);

  function patchDocument(changed) {
    setDocuments((current) => current.map((item) => (item.id === changed.id ? changed : item)));
  }

  return (
    <section className="page">
      <div className="section-title">
        <h2>{title || (favoriteOnly ? 'Mis favoritos' : 'Biblioteca musical')}</h2>
        <p>{description || 'Material ordenado por carpeta, subcarpeta y tipo de estudio'}</p>
      </div>
      {!loading && <LibraryOverview documents={allDocuments} filteredCount={documents.length} />}
      <FiltersBar
        filters={filters}
        setFilters={setFilters}
        categories={categoryOptions}
        folders={folders}
        sections={lockedSection ? [lockedSection] : sections}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      {!loading && sections.length > 0 && !lockedSection && (
        <SectionNavigator
          sections={sections}
          counts={sectionCounts}
          activeSection={filters.section}
          total={allDocuments.length}
          onSelect={(section) => setFilters({ ...filters, section })}
        />
      )}
      {!loading && <LibraryContext filters={filters} count={documents.length} />}
      {loading && <div className="empty-state">Cargando documentos...</div>}
      {error && <div className="empty-state">{error}</div>}
      {!loading && documents.length === 0 && <div className="empty-state">No hay documentos para mostrar.</div>}
      {!loading && documents.length > 0 && (
        <LibraryContent
          groupedDocuments={groupedDocuments}
          nestedGroups={nestedGroups}
          visibleSectionNames={visibleSectionNames}
          viewMode={viewMode}
          documents={documents}
          onChange={patchDocument}
        />
      )}
    </section>
  );
}
