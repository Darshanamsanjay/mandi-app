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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-10 border border-gray-100 text-center">
        
        <img 
          src="/logo.png" 
          alt="Mandi App Logo" 
          className="w-56 mx-auto mb-10 object-contain mix-blend-multiply contrast-125 brightness-110" 
        />
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Portal</h2>
        <p className="text-gray-500 text-sm mb-8">Please enter your secure PIN to continue.</p>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 animate-shake">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input 
              type="password" 
              placeholder="Enter PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="w-full bg-white border border-gray-300 p-4 rounded-lg text-center text-xl tracking-[0.5em] font-medium text-gray-800 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-gray-400"
              maxLength={4}
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-gray-900 hover:bg-black text-white font-medium py-4 rounded-lg transition-colors shadow-md"
          >
            Access Dashboard
          </button>
        </form>

        <div className="mt-8 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Mandi App. All rights reserved.
        </div>
      </div>
    </div>
  );
}
