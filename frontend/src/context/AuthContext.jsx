import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  async function login(email, password) {
    const nextUser = {
      id: 'local-admin',
      nombre: email.split('@')[0] || 'Músico',
      email,
      rol: 'admin',
      activo: true,
    };
    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  }

  function logout() {
    localStorage.removeItem('user');
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, logout, isAdmin: user?.rol === 'admin' }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
