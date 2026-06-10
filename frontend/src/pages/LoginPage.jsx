import { Music2 } from 'lucide-react';
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
      setError(err.response?.data?.message || 'No se pudo iniciar sesión');
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand login-brand">
          <Music2 size={34} />
          <div>
            <strong>Music Drive</strong>
            <span>Práctica, teoría y repertorio</span>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" /></label>
          <label>Contraseña<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" /></label>
          {error && <p className="error">{error}</p>}
          <button className="button primary" type="submit">Entrar</button>
        </form>
      </section>
    </main>
  );
}
