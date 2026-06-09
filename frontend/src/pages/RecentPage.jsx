import { Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHistory } from '../services/driveService.js';

export function RecentPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  return (
    <section className="page">
      <div className="section-title">
        <h2>Últimos vistos</h2>
        <p>Continuá desde la última página guardada</p>
      </div>
      <div className="timeline">
        {items.map((item) => (
          <Link key={item.id} className="timeline-item" to={`/documentos/${item.documento_id}`}>
            <Clock3 size={18} />
            <strong>{item.titulo}</strong>
            <span>Pagina {item.ultima_pagina} · {item.carpeta_ruta || item.carpeta_nombre} · {new Date(item.fecha_ultimo_acceso).toLocaleString()}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
