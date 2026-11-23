import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/index.css';

// Lazy-load admin panel to keep customer bundle small
const AdminAppModule = React.lazy(() =>
  import('./admin/AdminApp').then((m) => ({ default: m.AdminApp }))
);

// Route to admin panel if URL hash starts with #admin
function RootRouter() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (hash === '#admin' || hash.startsWith('#admin/')) {
    return (
      <React.Suspense fallback={
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#111318', fontFamily: 'sans-serif'
        }}>
          <div style={{ color: '#FFFFFF', fontSize: '1rem' }}>Loading Admin Panel…</div>
        </div>
      }>
        <AdminAppModule />
      </React.Suspense>
    );
  }
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RootRouter />
  </React.StrictMode>
);
