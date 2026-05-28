import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin.jsx';
import Dashboard from './Dashboard.jsx';
import Products from './Products.jsx';
import Orders from './Orders.jsx';
import BannerManager from './BannerManager.jsx';

export default function AdminApp() {
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('mandi_admin_auth') === 'true') {
      setIsAdminAuth(true);
    }
  }, []);

  if (!isAdminAuth) {
    return <AdminLogin onLogin={() => {
      localStorage.setItem('mandi_admin_auth', 'true');
      setIsAdminAuth(true);
    }} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('mandi_admin_auth');
    setIsAdminAuth(false);
  };

  const navItems = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'products', label: '🍎 Products' },
    { id: 'orders', label: '📦 Orders' },
    { id: 'banner', label: '🎉 Promo Banner' }
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} shadow-2xl flex flex-col`}>
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="text-mandi-primary text-2xl">⚡</span> Mandi Admin
          </h2>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id
                  ? 'bg-mandi-primary text-white shadow-lg shadow-mandi-primary/30'
                  : 'hover:bg-slate-800 hover:text-white'
                }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 font-medium py-3 rounded-xl transition-colors border border-slate-700 hover:border-red-500/30"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 md:px-8 justify-between shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-slate-500 p-2 rounded-lg hover:bg-slate-100"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="text-2xl font-bold">☰</span>
            </button>
            <h1 className="text-lg font-bold capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors" onClick={() => window.location.href = '/'}>
              View App ↗
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'products' && <Products />}
          {activeTab === 'orders' && <Orders />}
          {activeTab === 'banner' && <BannerManager />}
        </div>
      </main>
    </div>
  );
}
