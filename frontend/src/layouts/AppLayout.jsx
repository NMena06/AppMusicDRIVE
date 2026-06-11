import { BookMarked, CircleDot, FolderSync, Gauge, Guitar, Heart, Library, LogOut, Music2, PlaySquare, Timer } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FloatingMetronome } from '../components/FloatingMetronome.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function AppLayout() {
  const { logout, isAdmin } = useAuth();
  const location = useLocation();
  const isViewer = location.pathname.startsWith('/documentos/');
  const isMetronomePage = location.pathname === '/metronomo';

  return (
    <div className={isViewer ? 'app-shell viewer-shell' : 'app-shell'}>
      <aside className="sidebar">
        <div className="brand">
          <BookMarked size={28} />
          <div>
            <strong>Drive Nico</strong>
            <span>Biblioteca de estudio</span>
          </div>
        </div>
        <nav>
          {/* <NavLink to="/"><Gauge size={19} /> Dashboard</NavLink> */}
          <NavLink to="/biblioteca"><Library size={19} /> Biblioteca</NavLink>
          <NavLink to="/kiko"><Music2 size={19} /> KIKO</NavLink>
          <NavLink to="/tabs"><Guitar size={19} /> GP Tabs</NavLink>
          <NavLink to="/videos"><PlaySquare size={19} /> Videos</NavLink>
          <NavLink to="/armonia"><CircleDot size={19} /> Armonia</NavLink>
          <NavLink to="/metronomo"><Timer size={19} /> Metronomo</NavLink>
          <NavLink to="/favoritos"><Heart size={19} /> Favoritos</NavLink>
          {isAdmin && <NavLink to="/admin/drive"><FolderSync size={19} /> Google Drive</NavLink>}
        </nav>
        <button className="logout" onClick={logout}><LogOut size={18} /> Salir</button>
      </aside>
      <main className="main">
        <Outlet />
        {!isMetronomePage && <FloatingMetronome />}
      </main>
    </div>
  );
}
