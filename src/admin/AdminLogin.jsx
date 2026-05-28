import React, { useState } from 'react';

export default function AdminLogin({ onLogin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === '1234') {
      onLogin();
    } else {
      setError('Invalid PIN. Hint: 1234');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-mandi-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-900/20">
          <span className="text-3xl">🔐</span>
        </div>
        
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Admin Portal</h2>
        <p className="text-slate-500 text-sm font-medium mb-8">Enter your secure PIN to access the dashboard.</p>
        
        {error && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 animate-shake">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <input 
            type="password" 
            placeholder="Enter PIN (1234)"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl text-center text-xl tracking-widest font-bold focus:border-mandi-primary focus:outline-none transition-colors mb-6"
            maxLength={4}
          />
          
          <button 
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-slate-900/20 active:scale-[0.98]"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
