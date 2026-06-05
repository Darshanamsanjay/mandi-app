import React from 'react';
import { isWithinDeliveryZone } from '../utils/DeliveryZoneValidator';

export default function LocationBar({ address, mapCoords, onClick }) {
  const hasLocation = address && mapCoords;
  const isDeliverable = hasLocation ? isWithinDeliveryZone(mapCoords[0], mapCoords[1]) : false;

  return (
    <div className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm transition-all duration-300 w-full max-w-[480px] mx-auto">
      <div 
        onClick={onClick}
        className="px-4 py-3 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="text-2xl drop-shadow-sm">📍</span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              {hasLocation ? "Delivery To" : "Delivery Location"}
            </span>
            <div className="flex items-center gap-2">
              <h3 className="m-0 text-[14px] font-bold text-slate-800 truncate max-w-[200px] sm:max-w-[250px]">
                {hasLocation ? address : "Select Delivery Location"}
              </h3>
              <svg className="w-4 h-4 text-mandi-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
        
        {hasLocation && !isDeliverable && (
          <span className="shrink-0 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md border border-red-200 ml-2 shadow-sm whitespace-nowrap">
            Out of Zone
          </span>
        )}
      </div>
      
      {/* Service Unavailable Banner */}
      {hasLocation && !isDeliverable && (
        <div className="bg-red-50 px-4 py-2 text-center border-t border-red-100 flex items-center justify-center gap-2">
          <span className="text-red-600">⚠️</span>
          <span className="text-red-700 text-xs font-bold">Service is currently unavailable in your area.</span>
        </div>
      )}
    </div>
  );
}
