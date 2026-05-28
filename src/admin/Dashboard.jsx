import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let productsCount = 0;
    
    // Subscribe to products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      productsCount = snapshot.docs.length;
      updateStats();
    });

    // Subscribe to orders
    let currentOrders = [];
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      currentOrders = snapshot.docs.map(doc => doc.data());
      updateStats();
    });

    const updateStats = () => {
      const revenue = currentOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      setStats({
        products: productsCount,
        orders: currentOrders.length,
        revenue: revenue
      });
      setIsLoading(false);
    };

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {isLoading ? (
        <div className="text-center p-12 text-slate-500 font-bold animate-pulse">Loading live stats...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon="💰" title="Total Revenue" value={`₹${stats.revenue}`} color="bg-emerald-500" />
          <StatCard icon="📦" title="Total Orders" value={stats.orders} color="bg-blue-500" />
          <StatCard icon="🍎" title="Products" value={stats.products} color="bg-amber-500" />
        </div>
      )}
      
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg mb-4 text-slate-800">Live Connection Active</h3>
        <p className="text-slate-500 text-sm flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse-fast"></span>
          Dashboard is synced with Firestore in real-time.
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-500">{title}</p>
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
