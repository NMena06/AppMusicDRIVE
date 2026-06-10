import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AppLayout } from '../layouts/AppLayout.jsx';
import { AdminCategoriesPage } from '../pages/AdminCategoriesPage.jsx';
import { AdminDocumentsPage } from '../pages/AdminDocumentsPage.jsx';
import { AdminDrivePage } from '../pages/AdminDrivePage.jsx';
import { AdminUsersPage } from '../pages/AdminUsersPage.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { FavoritesPage } from '../pages/FavoritesPage.jsx';
import { GuitarProTabsPage } from '../pages/GuitarProTabsPage.jsx';
import { KikoPage } from '../pages/KikoPage.jsx';
import { LibraryPage } from '../pages/LibraryPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { MetronomePage } from '../pages/MetronomePage.jsx';
import { RecentPage } from '../pages/RecentPage.jsx';
import { ViewerPage } from '../pages/ViewerPage.jsx';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="boot">Cargando biblioteca...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/" replace />;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="biblioteca" element={<LibraryPage />} />
          <Route path="kiko" element={<KikoPage />} />
          <Route path="tabs" element={<GuitarProTabsPage />} />
          <Route path="metronomo" element={<MetronomePage />} />
          <Route path="favoritos" element={<FavoritesPage />} />
          <Route path="ultimos" element={<RecentPage />} />
          <Route path="documentos/:id" element={<ViewerPage />} />
          <Route path="admin/documentos" element={<AdminRoute><AdminDocumentsPage /></AdminRoute>} />
          <Route path="admin/categorias" element={<AdminRoute><AdminCategoriesPage /></AdminRoute>} />
          <Route path="admin/drive" element={<AdminRoute><AdminDrivePage /></AdminRoute>} />
          <Route path="admin/usuarios" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
