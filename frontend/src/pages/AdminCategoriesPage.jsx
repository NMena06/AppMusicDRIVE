import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCategories, saveCategories } from '../services/driveService.js';

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [nombre, setNombre] = useState('');

  function load() {
    setCategories(getCategories());
  }

  useEffect(() => {
    load();
  }, []);

  async function createCategory(event) {
    event.preventDefault();
    if (!nombre.trim()) return;
    saveCategories([...categories, { id: nombre, nombre, activo: true }]);
    setNombre('');
    load();
  }

  function updateCategory(category) {
    saveCategories(categories.map((item) => (item.id === category.id ? category : item)));
    load();
  }

  function removeCategory(id) {
    saveCategories(categories.filter((category) => category.id !== id));
    load();
  }

  return (
    <section className="page">
      <div className="section-title">
        <h2>Gestión de categorías</h2>
        <p>Organizá la biblioteca por técnica, teoría, canciones y métodos</p>
      </div>
      <form className="inline-form" onSubmit={createCategory}>
        <input value={nombre} onChange={(event) => setNombre(event.target.value)} placeholder="Nueva categoría" />
        <button className="button primary" type="submit"><Plus size={17} /> Crear</button>
      </form>
      <div className="table-wrap">
        <table>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td><input value={category.nombre} onChange={(event) => setCategories((items) => items.map((item) => item.id === category.id ? { ...item, nombre: event.target.value } : item))} /></td>
                <td><label className="check"><input type="checkbox" checked={category.activo} onChange={(event) => setCategories((items) => items.map((item) => item.id === category.id ? { ...item, activo: event.target.checked } : item))} /> Activa</label></td>
                <td className="table-actions">
                  <button className="icon-button" onClick={() => updateCategory(category)} title="Guardar"><Save size={17} /></button>
                  <button className="icon-button danger" onClick={() => removeCategory(category.id)} title="Eliminar"><Trash2 size={17} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
