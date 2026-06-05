import React, { useEffect, useRef, useState } from 'react';
import { mappls, mappls_plugin } from 'mappls-web-maps';

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

    console.log("[Mappls] Initializing Map SDK...");
    const token = "bweqhgqhltgaltkwaexwsdgotghvblzvqjuk";
    
    try {
      const mapplsClassObject = new mappls();
      mapplsClassObject.initialize(token, { map: true, plugins: ['rev_geocode'] }, () => {
        console.log("[Mappls] SDK Initialized. Creating map instance...");
        try {
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

          console.log("[Mappls] Map instance created successfully.");

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
            console.log("[Mappls] Map clicked at:", { lat, lng });
            marker.setPosition({ lat, lng });
            handleLocationChange(lat, lng);
          });

          // Handle marker drag
          marker.addListener('dragend', () => {
            const pos = marker.getPosition();
            if(pos) {
              console.log("[Mappls] Marker dragged to:", pos);
              handleLocationChange(pos.lat, pos.lng);
            }
          });

          // Fetch address for initial position ONLY after map is loaded
          handleLocationChange(MANDI_COORDS.lat, MANDI_COORDS.lng);
        } catch (err) {
          console.error("[Mappls] Failed to render map instance. This usually indicates an invalid token, domain whitelist issue, or missing container.", err);
          setIsGeocoding(false);
          setAddress("Map render failed. Please check console logs.");
        }
      });
    } catch(err) {
      console.error("[Mappls] Map initialization failed completely:", err);
      setIsGeocoding(false);
      setAddress("Map failed to load. Check API key and domain whitelist.");
    }

    return () => {
      // Cleanup
    };
  }, []);

  const handleLocationChange = async (lat, lng, autoConfirm = false) => {
    setCurrentPosition({ lat, lng });
    
    // Check distance
    if (!isWithinDeliveryZone(lat, lng)) {
      setIsOutOfArea(true);
      setAddress("⚠️ Sorry! Mee location maa 5 KM delivery zone bayata undi. Prastutam maa services available levu.");
      setIsGeocoding(false);
      // We explicitly do NOT auto-confirm if they are out of the zone
      // so they can see the error message.
      return;
    } else {
      setIsOutOfArea(false);
    }

    setIsGeocoding(true);
    setAddress("Fetching address...");
    console.log("[Mappls] Reverse geocoding for:", { lat, lng });
    
    // Failsafe timeout in case API silently fails (CORS, 401, etc.)
    let callbackExecuted = false;
    const timeoutId = setTimeout(() => {
      if (!callbackExecuted) {
        console.error("[Mappls] Reverse geocoding timed out. This is likely a CORS or 401 Unauthorized error due to Domain Whitelisting on Vercel.");
        setAddress("Error fetching address. Ensure domain is whitelisted.");
        setIsGeocoding(false);
      }
    }, 5000);

    try {
      if (typeof mappls_plugin === "undefined" || !mappls_plugin.rev_geocode) {
        // Fallback to window.mappls_plugin just in case
        if (typeof window.mappls_plugin !== "undefined" && window.mappls_plugin.rev_geocode) {
           window.mappls_plugin.rev_geocode({ lat: lat, lng: lng }, (data) => {
             callbackExecuted = true;
             clearTimeout(timeoutId);
             console.log("[Mappls] Geocode response (window):", data);
             
             if (data && data.results && data.results.length > 0) {
               setAddress(data.results[0].formatted_address);
               if (autoConfirm) onConfirm(data.results[0].formatted_address, { lat, lng });
             } else if (data && data.copResults) {
               setAddress(data.copResults.formattedAddress);
               if (autoConfirm) onConfirm(data.copResults.formattedAddress, { lat, lng });
             } else {
               setAddress("Could not fetch address for this location.");
             }
             setIsGeocoding(false);
           });
           return;
        }
        throw new Error("Mappls plugin not loaded from NPM or Window. Ensure token is valid.");
      }
      
      mappls_plugin.rev_geocode({ lat: lat, lng: lng }, (data) => {
        callbackExecuted = true;
        clearTimeout(timeoutId);
        console.log("[Mappls] Geocode response (NPM):", data);
        
        if (data && data.results && data.results.length > 0) {
          setAddress(data.results[0].formatted_address);
          if (autoConfirm) onConfirm(data.results[0].formatted_address, { lat, lng });
        } else if (data && data.copResults) {
          setAddress(data.copResults.formattedAddress);
          if (autoConfirm) onConfirm(data.copResults.formattedAddress, { lat, lng });
        } else {
          setAddress("Could not fetch address for this location.");
        }
        setIsGeocoding(false);
      });
    } catch(e) {
      callbackExecuted = true;
      clearTimeout(timeoutId);
      console.error("========== GEOCODING EXCEPTION ==========");
      console.error("Error Object:", e);
      if (e instanceof Error) {
        console.error("Error Name:", e.name);
        console.error("Error Message:", e.message);
        console.error("Error Stack:", e.stack);
      }
      setAddress("Error fetching address. Please try again.");
      setIsGeocoding(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    console.log("========== CURRENT LOCATION DEBUG FLOW ==========");
    console.log("[1] Button clicked. Requesting browser geolocation...");

    // Check permissions
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const perm = await navigator.permissions.query({ name: 'geolocation' });
        console.log("[2] Geolocation Permission Status:", perm.state);
      } else {
        console.log("[2] Permissions API not supported, proceeding to request...");
      }
    } catch(e) {
      console.log("[2] Could not query permissions:", e);
    }

    if (navigator.geolocation) {
      setIsGeocoding(true);
      setAddress("Detecting your location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("[3] SUCCESS: Coordinates received from navigator:", { latitude, longitude });
          
          try {
            if (markerRef.current) {
              console.log("[4] Moving marker to:", { lat: latitude, lng: longitude });
              markerRef.current.setPosition({ lat: latitude, lng: longitude });
              console.log("[4] Marker moved successfully.");
            } else {
              console.warn("[4] Marker ref is null!");
            }
          } catch (err) {
            console.error("[4] FAILED to move marker:", err);
          }

          try {
            if (mapRef.current) {
              console.log("[5] Attempting to center map to:", { lat: latitude, lng: longitude });
              if (typeof mapRef.current.panTo === "function") {
                 console.log("[5] Using mapRef.current.panTo()");
                 mapRef.current.panTo({ lat: latitude, lng: longitude });
              } else if (typeof mapRef.current.setCenter === "function") {
                 console.log("[5] Using mapRef.current.setCenter()");
                 mapRef.current.setCenter({ lat: latitude, lng: longitude });
              } else {
                 console.warn("[5] Map reference does not have panTo or setCenter functions!");
              }
              console.log("[5] Map centered successfully.");
            } else {
              console.warn("[5] Map ref is null!");
            }
          } catch (err) {
            console.error("[5] FAILED to center map with object format:", err);
            try {
               console.log("[5] Fallback: Trying setCenter with array [longitude, latitude]...");
               mapRef.current.setCenter([longitude, latitude]);
            } catch (fallbackErr) {
               console.error("[5] Fallback failed too:", fallbackErr);
            }
          }

          console.log("[6] Triggering handleLocationChange to reverse geocode:", { latitude, longitude });
          handleLocationChange(latitude, longitude, true); // true = autoConfirm
        },
        (error) => {
          console.error("========== GEOLOCATION FAILED ==========");
          console.error("Error Code:", error.code);
          console.error("Error Message:", error.message);
          alert(`Could not fetch your location. Error: ${error.message}`);
          setIsGeocoding(false);
          setAddress("Please confirm location manually.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error("========== GEOLOCATION NOT SUPPORTED ==========");
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-50 animate-slide-up-sheet max-w-[480px] mx-auto">
      <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm">
        <h3 className="m-0 text-lg font-bold">Pin Location</h3>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full font-bold text-slate-600 active:bg-slate-200 border-none">✕</button>
      </div>
      
      <div className="flex-1 relative min-h-[350px]">
        <div id="mappls-map-container" ref={mapContainerRef} className="w-full h-full z-10 relative bg-slate-200 flex items-center justify-center">
          {/* Fallback text behind the map in case tiles fail to load */}
          <span className="text-slate-400 absolute z-0 text-sm font-medium px-8 text-center">
            Map tiles loading...<br/>If this stays blank on Vercel, Mappls is blocking the domain.
          </span>
        </div>
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
