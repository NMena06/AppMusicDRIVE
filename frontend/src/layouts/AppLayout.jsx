import { BookMarked, Clock3, FileText, FolderSync, Gauge, Guitar, Heart, Library, LogOut, Music2, Tags, Timer, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { FloatingMetronome } from '../components/FloatingMetronome.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function AppLayout() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <BookMarked size={28} />
          <div>
            <strong>Music Drive</strong>
            <span>Biblioteca de estudio</span>
          </div>
        </div>
        <nav>
          <NavLink to="/"><Gauge size={19} /> Dashboard</NavLink>
          <NavLink to="/biblioteca"><Library size={19} /> Biblioteca</NavLink>
          <NavLink to="/kiko"><Music2 size={19} /> KIKO</NavLink>
          <NavLink to="/tabs"><Guitar size={19} /> GP Tabs</NavLink>
          <NavLink to="/metronomo"><Timer size={19} /> Metrónomo</NavLink>
          <NavLink to="/favoritos"><Heart size={19} /> Favoritos</NavLink>
          <NavLink to="/ultimos"><Clock3 size={19} /> Últimos vistos</NavLink>
          {isAdmin && <NavLink to="/admin/documentos"><FileText size={19} /> Documentos</NavLink>}
          {isAdmin && <NavLink to="/admin/categorias"><Tags size={19} /> Categorías</NavLink>}
          {isAdmin && <NavLink to="/admin/drive"><FolderSync size={19} /> Google Drive</NavLink>}
          {isAdmin && <NavLink to="/admin/usuarios"><Users size={19} /> Usuarios</NavLink>}
        </nav>
        <button className="logout" onClick={logout}><LogOut size={18} /> Salir</button>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <span>Espacio de práctica</span>
            <h1>Hola, {user?.nombre}</h1>
          </div>
          <div className="user-pill">{user?.rol}</div>
        </header>
        <Outlet />
        <FloatingMetronome />
      </main>
    </div>
  );
}
