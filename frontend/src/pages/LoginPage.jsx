import { BookOpen, Guitar, Music2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@guitar.local');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo iniciar sesion');
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-showcase">
          <div className="login-orbit">
            <img src="/nmena-icon.svg" alt="" />
          </div>
          <span>Estudio personal de guitarra</span>
          <h1>NMENA Studio</h1>
          <p>Biblioteca, cursos, tabs, armonia y practica diaria en un mismo lugar.</p>

          <div className="login-feature-grid" aria-label="Funciones principales">
            <div>
              <BookOpen size={18} />
              <strong>Cursos</strong>
              <small>Videos, PDFs y material por modulo</small>
            </div>
            <div>
              <Guitar size={18} />
              <strong>Tabs</strong>
              <small>GP, PDF y practica guiada</small>
            </div>
            <div>
              <Sparkles size={18} />
              <strong>Armonia</strong>
              <small>Progresiones, modos y canciones</small>
            </div>
          </div>
        </div>

        <div className="login-panel">
          <div className="brand login-brand">
            <img className="brand-mark" src="/nmena-icon.svg" alt="" />
            <div>
              <strong>Entrar a NMENA</strong>
              <span>Practica, teoria y repertorio</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" /></label>
            <label>Contrasena<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" /></label>
            {error && <p className="error">{error}</p>}
            <button className="button primary" type="submit">
              <Music2 size={17} />
              Entrar
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
