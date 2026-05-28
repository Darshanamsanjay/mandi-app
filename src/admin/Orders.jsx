import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const liveOrders = snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id }));
      setOrders(liveOrders);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const updateStatus = async (firestoreId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', firestoreId), { status: newStatus });
    } catch (e) {
      alert("Error updating order: " + e.message);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-slate-100 text-slate-800 border-slate-200';
    if (status.includes('Preparing')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (status.includes('Delivered')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (status.includes('Cancelled')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">Manage Orders</h2>
          <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Updates
          </span>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
             <div className="text-center p-8 text-slate-500 font-bold animate-pulse">Waiting for incoming orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center p-8 text-slate-500 font-medium">No orders received yet.</div>
          ) : (
            orders.sort((a,b) => b.timestamp - a.timestamp).map(order => (
              <div key={order.firestoreId} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 animate-fade-in relative overflow-hidden">
                {/* Highlight new orders temporarily if needed, here just basic styling */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-extrabold text-slate-900 text-lg">{order.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-600 mb-2 space-y-1">
                    <p><strong>Customer:</strong> {order.customerName} ({order.phone})</p>
                    <p><strong>Address:</strong> {order.address}</p>
                    <p><strong>Time:</strong> {order.time}</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-xl border border-slate-200 mt-3">
                    <p className="text-xs font-bold text-slate-500 mb-2">ITEMS ({(order.items || []).length})</p>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm font-medium text-slate-700">
                        <span>{item.quantity} x {item.name}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t border-slate-100 mt-2 pt-2 flex justify-between font-extrabold text-mandi-primary">
                      <span>Total</span>
                      <span>₹{order.total}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[160px] shrink-0 border-t border-slate-200 md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 z-10">
                  <p className="text-xs font-bold text-slate-500 text-center">Update Status</p>
                  <button onClick={() => updateStatus(order.firestoreId, '📦 Preparing')} className="px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-xl font-bold text-sm hover:bg-amber-50 shadow-sm">Preparing</button>
                  <button onClick={() => updateStatus(order.firestoreId, '🛵 Out for Delivery')} className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 shadow-sm">Out for Delivery</button>
                  <button onClick={() => updateStatus(order.firestoreId, '✅ Delivered')} className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-500/20 hover:bg-emerald-600">Delivered</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
