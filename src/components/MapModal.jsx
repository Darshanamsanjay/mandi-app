import React, { useEffect, useRef, useState } from 'react';
import { mappls } from 'mappls-web-maps';

import { isWithinDeliveryZone, MANDI_COORDS } from '../utils/DeliveryZoneValidator';

export default function MapModal({ onClose, onConfirm }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [currentPosition, setCurrentPosition] = useState({ lat: MANDI_COORDS.lat, lng: MANDI_COORDS.lng });
  const [address, setAddress] = useState("Fetching address...");
  const [isOutOfArea, setIsOutOfArea] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(true);

  const isInitialized = useRef(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Call it immediately so the address starts fetching even if map script fails
    handleLocationChange(MANDI_COORDS.lat, MANDI_COORDS.lng);

    const token = "bweqhgqhltgaltkwaexwsdgotghvblzvqjuk";
    
    try {
      const mapplsClassObject = new mappls();
      mapplsClassObject.initialize(token, { map: true }, () => {
        // Map initialization
        const mapObject = mapplsClassObject.Map({
          id: mapContainerRef.current.id,
          properties: {
            center: [MANDI_COORDS.lat, MANDI_COORDS.lng],
            zoom: 15,
            zoomControl: true,
            clickableIcons: false
          }
        });
        mapRef.current = mapObject;

        // Add draggable marker
        const marker = mapplsClassObject.Marker({
          map: mapObject,
          position: { lat: MANDI_COORDS.lat, lng: MANDI_COORDS.lng },
          draggable: true,
        });
        markerRef.current = marker;

        // Handle map click
        mapObject.addListener('click', (e) => {
          const { lat, lng } = e.lngLat;
          marker.setPosition({ lat, lng });
          handleLocationChange(lat, lng);
        });

        // Handle marker drag
        marker.addListener('dragend', () => {
          const pos = marker.getPosition();
          if(pos) {
            handleLocationChange(pos.lat, pos.lng);
          }
        });
      });
    } catch(err) {
      console.error("Map initialization failed:", err);
      setIsGeocoding(false);
      setAddress("Map failed to load. Please confirm location manually.");
    }

    return () => {
      // Any cleanup if required
    };
  }, []);

  const handleLocationChange = async (lat, lng) => {
    setCurrentPosition({ lat, lng });
    
    // Check distance
    if (!isWithinDeliveryZone(lat, lng)) {
      setIsOutOfArea(true);
      setAddress("⚠️ We currently do not deliver to this location.");
      setIsGeocoding(false);
      return;
    } else {
      setIsOutOfArea(false);
    }

    setIsGeocoding(true);
    setAddress("Fetching address...");
    try {
      if (typeof window.mappls_plugin === "undefined" || !window.mappls_plugin.rev_geocode) {
        throw new Error("Mappls plugin not loaded. Ensure token is valid.");
      }
      
      window.mappls_plugin.rev_geocode({ lat: lat, lng: lng }, (data) => {
        if (data && data.results && data.results.length > 0) {
          setAddress(data.results[0].formatted_address);
        } else if (data && data.copResults) {
          setAddress(data.copResults.formattedAddress);
        } else {
          setAddress("Could not fetch address for this location.");
        }
        setIsGeocoding(false);
      });
    } catch(e) {
      console.error("Geocoding failed:", e);
      setAddress("Error fetching address. Please try again.");
      setIsGeocoding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-50 animate-slide-up-sheet max-w-[480px] mx-auto">
      <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm">
        <h3 className="m-0 text-lg font-bold">Pin Location</h3>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full font-bold text-slate-600 active:bg-slate-200 border-none">✕</button>
      </div>
      
      <div className="flex-1 relative">
        <div id="mappls-map-container" ref={mapContainerRef} className="w-full h-full z-10 relative"></div>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-slate-200 text-xs font-bold text-slate-700 z-[1000] pointer-events-none whitespace-nowrap">
          Tap map to move pin
        </div>
      </div>
      
      <div className="p-4 bg-white border-t border-slate-200 pb-[calc(16px+env(safe-area-inset-bottom))] shadow-[0_-10px_20px_rgba(0,0,0,0.05)] relative z-20">
        <div className="mb-4">
          <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Selected Address</p>
          <p className={`text-sm font-medium ${isOutOfArea ? 'text-red-600' : 'text-slate-800'}`}>
            {address}
          </p>
        </div>
        <button 
          disabled={isOutOfArea || isGeocoding}
          onClick={() => {
            onConfirm({ address, lat: currentPosition.lat, lng: currentPosition.lng });
          }}
          className="w-full bg-mandi-primary text-white font-bold py-3.5 rounded-xl shadow-md active:scale-95 transition-transform text-sm disabled:opacity-50 disabled:active:scale-100"
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
}
