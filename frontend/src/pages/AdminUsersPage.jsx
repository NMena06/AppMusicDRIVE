import { useAuth } from '../context/AuthContext.jsx';

export function AdminUsersPage() {
  const { user } = useAuth();

  return (
    <section className="page">
      <div className="section-title">
        <h2>Modo local</h2>
        <p>Esta versión no usa base de datos ni servidor de usuarios.</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Activo</th><th>Alta</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>{user?.nombre}</td>
              <td>{user?.email}</td>
              <td>{user?.rol}</td>
              <td>Sí</td>
              <td>{new Date().toLocaleDateString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
