import React from 'react';

export default function LocationPicker({ address, mapCoords, onOpenMap }) {
  return (
    <div className="relative">
      <textarea 
        placeholder="Complete Delivery Address" 
        value={address} 
        readOnly
        className="w-full p-4 pb-14 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none transition-colors min-h-[120px] resize-y" 
      />
      <button 
        onClick={(e) => {
          e.preventDefault();
          onOpenMap();
        }} 
        className="absolute bottom-3 left-3 bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform shadow-sm"
      >
        <span>📍</span> {mapCoords ? "Location Pinned" : "Pin Location on Map"}
      </button>
    </div>
  );
}
