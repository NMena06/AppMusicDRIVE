import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchDriveDocuments, getCategories, setDocumentMeta } from '../services/driveService.js';

export function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);

  async function load() {
    const docs = await fetchDriveDocuments();
    const cats = getCategories();
    setDocuments(docs);
    setCategories(cats);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(document) {
    setDocumentMeta(document.id, {
      nombre_visible: document.nombre_visible,
      categoria_id: document.categoria_id,
    });
    load();
  }

  return (
    <section className="page">
      <div className="section-title">
        <h2>Gestión de documentos</h2>
        <p>Editá títulos, categorías y visibilidad</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Nombre visible</th><th>Categoría</th><th>Carpeta</th><th></th></tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.id}>
                <td><input value={document.nombre_visible || document.nombre} onChange={(event) => setDocuments((items) => items.map((item) => item.id === document.id ? { ...item, nombre_visible: event.target.value } : item))} /></td>
                <td>
                  <select value={document.categoria_id || ''} onChange={(event) => setDocuments((items) => items.map((item) => item.id === document.id ? { ...item, categoria_id: event.target.value } : item))}>
                    <option value="">Sin categoría</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}
                  </select>
                </td>
                <td>{document.carpeta_nombre || 'Principal'}</td>
                <td><button className="icon-button" onClick={() => save(document)} title="Guardar"><Save size={17} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
