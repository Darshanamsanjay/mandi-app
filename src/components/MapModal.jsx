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

    const token = "bweqhgqhltgaltkwaexwsdgotghvblzvqjuk";
    
    try {
      const mapplsClassObject = new mappls();
      mapplsClassObject.initialize(token, { map: true, plugins: ['rev_geocode'] }, () => {
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

        // Fetch address for initial position ONLY after map is loaded
        handleLocationChange(MANDI_COORDS.lat, MANDI_COORDS.lng);
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
      setAddress("⚠️ Sorry! Mee location maa 5 KM delivery zone bayata undi. Prastutam maa services available levu.");
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

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGeocoding(true);
      setAddress("Detecting your location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (markerRef.current) {
            markerRef.current.setPosition({ lat: latitude, lng: longitude });
          }
          if (mapRef.current && mapRef.current.panTo) {
             mapRef.current.panTo({ lat: latitude, lng: longitude });
          } else if (mapRef.current && mapRef.current.setCenter) {
             mapRef.current.setCenter({ lat: latitude, lng: longitude });
          }
          handleLocationChange(latitude, longitude);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          alert("Could not fetch your location. Please check your permissions.");
          setIsGeocoding(false);
          setAddress("Please confirm location manually.");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
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
        
        {/* Floating Current Location Button */}
        <button 
          onClick={handleUseCurrentLocation}
          className="absolute bottom-4 right-4 z-[1000] bg-white text-mandi-primary p-3 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-slate-100 flex items-center justify-center active:scale-95 transition-transform"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
          </svg>
        </button>
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
