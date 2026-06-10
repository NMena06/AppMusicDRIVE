import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { MetronomeProvider } from './context/MetronomeContext.jsx';
import { AppRoutes } from './routes/AppRoutes.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <MetronomeProvider>
        <AppRoutes />
      </MetronomeProvider>
    </AuthProvider>
  </React.StrictMode>,
);
