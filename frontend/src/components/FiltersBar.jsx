import { Grid2X2, List, Search } from 'lucide-react';

export function FiltersBar({ filters, setFilters, categories, folders, sections, viewMode, setViewMode }) {
  return (
    <div className="filters-bar">
      <label className="search-box">
        <Search size={18} />
        <input
          value={filters.search || ''}
          onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          placeholder="Buscar por nombre, carpeta o ruta"
        />
      </label>
      <select value={filters.categoryId || ''} onChange={(event) => setFilters({ ...filters, categoryId: event.target.value })}>
        <option value="">Todas las categorias</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.nombre}
          </option>
        ))}
      </select>
      <select value={filters.section || ''} onChange={(event) => setFilters({ ...filters, section: event.target.value })}>
        <option value="">Todas las carpetas principales</option>
        {sections.map((section) => (
          <option key={section} value={section}>
            {section}
          </option>
        ))}
      </select>
      <select value={filters.folder || ''} onChange={(event) => setFilters({ ...filters, folder: event.target.value })}>
        <option value="">Todas las carpetas</option>
        {folders.map((folder) => (
          <option key={folder} value={folder}>
            {folder}
          </option>
        ))}
      </select>
      <select value={filters.sort || 'nombre'} onChange={(event) => setFilters({ ...filters, sort: event.target.value })}>
        <option value="nombre">Nombre</option>
        <option value="fecha">Fecha</option>
        <option value="categoria">Categoria</option>
      </select>
      <div className="segmented">
        <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} title="Grilla">
          <Grid2X2 size={18} />
        </button>
        <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} title="Lista">
          <List size={18} />
        </button>
      </div>
    </div>
  );
}
