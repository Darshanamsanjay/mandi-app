import React, { useState, useEffect } from 'react';
import App from './App.jsx';
import AdminApp from './admin/AdminApp.jsx';

export default function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  if (currentPath.startsWith('/admin')) {
    return <AdminApp />;
  }

  return <App />;
}
