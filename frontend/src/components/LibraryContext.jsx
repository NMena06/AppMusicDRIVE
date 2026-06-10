export function LibraryContext({ filters, count }) {
  const parts = [
    filters.section && `Carpeta: ${filters.section}`,
    filters.type === 'guitar-pro' && 'Tipo: Guitar Pro',
    filters.type === 'pdf' && 'Tipo: PDF',
    filters.categoryId && `Categoría: ${filters.categoryId}`,
    filters.folder && `Subcarpeta: ${filters.folder}`,
    filters.search && `Búsqueda: "${filters.search}"`,
  ].filter(Boolean);

  return (
    <div className="library-context">
      <span>{parts.length ? parts.join(' / ') : 'Estás viendo toda la biblioteca'}</span>
      <strong>{count} resultados</strong>
    </div>
  );
}
