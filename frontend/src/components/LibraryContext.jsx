export function LibraryContext({ filters, count }) {
  const parts = [
    filters.section && `Carpeta: ${filters.section}`,
    filters.categoryId && `Categoria: ${filters.categoryId}`,
    filters.folder && `Subcarpeta: ${filters.folder}`,
    filters.search && `Busqueda: "${filters.search}"`,
  ].filter(Boolean);

  return (
    <div className="library-context">
      <span>{parts.length ? parts.join(' / ') : 'Estas viendo toda la biblioteca'}</span>
      <strong>{count} resultados</strong>
    </div>
  );
}
