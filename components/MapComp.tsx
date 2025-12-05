
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, ZoomControl, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { GeoapifyPlace, UserLocation, Tab } from '../types';
import { MAP_TILE_URL, MAP_ATTRIBUTION } from '../services/geoapifyService';
import SpotInfoPanel from './SpotInfoPanel';
import { trackPlaceClick } from '../services/analyticsService';

interface MapCompProps {
  userLocation: UserLocation | null;
  places: GeoapifyPlace[];
  onPlaceSelect: (place: GeoapifyPlace) => void;
  selectedPlaceId?: string;
  activeTab: Tab;
  onClosePanel: () => void;
}

// Helper to strictly validate coordinates
const isValidCoordinate = (lat: any, lng: any): boolean => {
  return typeof lat === 'number' && isFinite(lat) && !isNaN(lat) &&
         typeof lng === 'number' && isFinite(lng) && !isNaN(lng);
};

const LocationCenterer = ({ position }: { position: UserLocation | null }) => {
  const map = useMap();
  const initializedRef = useRef(false);

  useEffect(() => {
    // Strict check for valid numeric coordinates
    if (position && isValidCoordinate(position.lat, position.lng) && !initializedRef.current) {
      
      try {
          // Step 1: Immediately center on user with a standard close-up view (Level 14)
          map.setView([position.lat, position.lng], 14, { animate: false });
          
          // Step 2: After a short delay, smoothly zoom out to "50%" (Level 11 - Area View)
          const timer = setTimeout(() => {
            try {
                map.flyTo([position.lat, position.lng], 11, { 
                    animate: true, 
                    duration: 0.8 // Reduced from 1.0 for snappier feel
                });
            } catch (e) {
                console.warn("Map flyTo failed (unmount?)", e);
            }
          }, 1000);
    
          initializedRef.current = true;
          return () => clearTimeout(timer);
      } catch (e) {
          console.error("Error setting map view", e);
      }
    }
  }, [position, map]);
  return null;
};

const MapEffect = ({ selectedPlaceId, places, userLocation }: { selectedPlaceId?: string, places: GeoapifyPlace[], userLocation: UserLocation | null }) => {
  const map = useMap();
  const prevSelectionRef = useRef<string | undefined>(undefined);
  
  useEffect(() => {
    // Case 1: A place is selected -> Zoom in to a contextual view (Level 15)
    if (selectedPlaceId) {
        const place = places.find(p => p.properties.place_id === selectedPlaceId);
        
        // Strict validation before flying
        if (place && 
            place.properties &&
            isValidCoordinate(place.properties.lat, place.properties.lon)) {
           
           // Offset calculation: Move camera slightly North so marker appears lower
           const LAT_OFFSET_NORTH = 0.002; // Increased to push marker down
           
           const targetLat = place.properties.lat + LAT_OFFSET_NORTH;
           const targetLon = place.properties.lon;

           if (isValidCoordinate(targetLat, targetLon)) {
               try {
                   map.flyTo([targetLat, targetLon], 15, {
                    animate: true,
                    duration: 0.4,
                    easeLinearity: 0.25
                   });
               } catch (e) {
                   console.warn("Map flyTo place failed", e);
               }
           }
        }
        prevSelectionRef.current = selectedPlaceId;
    } 
    // Case 2: Panel was closed -> Zoom out ~50% (Level 13)
    else if (prevSelectionRef.current && !selectedPlaceId) {
        try {
            // Check userLocation validity strictly
            if (userLocation && isValidCoordinate(userLocation.lat, userLocation.lng)) {
                map.flyTo([userLocation.lat, userLocation.lng], 13, { animate: true, duration: 0.4 });
            } else {
                map.setZoom(13);
            }
        } catch (e) {
            console.warn("Map zoom out failed", e);
        }
        prevSelectionRef.current = undefined;
    }
  }, [selectedPlaceId, places, map, userLocation]);
  
  return null;
};

// Component to handle map background clicks to close the panel
const MapClickHandler = ({ onClose }: { onClose: () => void }) => {
  useMapEvents({
    click: () => {
      onClose();
    },
  });
  return null;
};

// Updated to accept 'distance' for conditional highlighting
const createCustomIcon = (isSelected: boolean, type: 'user' | 'place', distance: number = 0) => {
  const size = type === 'user' ? 80 : (isSelected ? 50 : 38); 
  
  let iconHtml = '';

  if (type === 'user') {
    // Updated to Premium Electric BLUE Radar Theme
    // Removed backdrop-blur and heavy shadows for mobile performance
    iconHtml = `
      <div class="relative flex flex-col items-center justify-center w-full h-full pointer-events-none">
         <div class="relative flex items-center justify-center w-[80px] h-[80px]">
            <!-- Outer Rotating Dashed Ring (Blue) -->
            <div class="absolute inset-0 border-[1px] border-dashed border-blue-500/40 rounded-full animate-[spin_10s_linear_infinite]"></div>
            
            <!-- Inner Rotating Solid Ring (Reverse) -->
            <div class="absolute inset-[15px] border-[1px] border-blue-400/30 rounded-full" style="animation: spin 8s linear infinite reverse;"></div>
            
            <!-- Radar Sweep Gradient -->
            <div class="absolute inset-[20px] rounded-full bg-gradient-to-tr from-blue-500/20 to-transparent animate-pulse"></div>
            
            <!-- Core Glow -->
            <div class="absolute w-3 h-3 bg-blue-400 rounded-full z-10"></div>
            
            <!-- Ping Effect -->
            <div class="absolute w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-50"></div>

            <!-- Label -->
            <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-black/90 border border-blue-500/50 rounded text-center">
                <p class="text-[8px] font-bold text-blue-300 whitespace-nowrap tracking-[0.2em] m-0">YOU</p>
            </div>
         </div>
      </div>
    `;
  } else {
    // Place Marker
    const isNearby = distance < 10000; // 10km in meters
    
    let colorClass = 'text-gray-600 fill-gray-900'; // Default Far
    let indicator = '';

    if (isSelected) {
        // Selected: Pure White with Black Fill (Blueprint style)
        colorClass = 'text-white fill-black';
        indicator = `<div class="absolute top-0 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-pulse border border-black"></div>`;
    } else if (isNearby) {
        // Nearby: Premium Green
        colorClass = 'text-green-500 fill-green-950/80';
    }

    const sizePx = isSelected ? 42 : 32;

    iconHtml = `
      <div class="transition-all duration-300 transform ${isSelected ? 'scale-110 -translate-y-2' : ''} flex flex-col items-center pointer-events-auto">
         <div class="relative flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin ${colorClass}">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${indicator}
         </div>
      </div>
    `;
  }

  // Adjust Anchor Logic:
  // If Selected, the visual icon moves UP by 8px (-translate-y-2).
  // We must shift the popup anchor UP by 8px to track the new head position.
  const visualLiftOffset = isSelected ? -8 : 0;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2], 
    popupAnchor: [0, (-size / 2) + visualLiftOffset],
  });
};

// PERFORMANCE OPTIMIZATION: Memoize the Marker component to prevent re-rendering all markers on selection change.
const MemoizedMarker = React.memo(function MemoizedMarker({ place, isSelected, onPlaceSelect }: { place: GeoapifyPlace, isSelected: boolean, onPlaceSelect: (place: GeoapifyPlace) => void }) {
    const distance = place.properties.distance || 0;
    
    return (
        <Marker
            position={[place.properties.lat, place.properties.lon]}
            icon={createCustomIcon(isSelected, 'place', distance)}
            eventHandlers={{
                click: (e) => {
                    L.DomEvent.stopPropagation(e); // Prevent map click from firing
                    // ANALYTICS TRACKING: Send event when marker is clicked
                    trackPlaceClick(place.properties.name, place.properties.place_id);
                    onPlaceSelect(place);
                }
            }}
            zIndexOffset={isSelected ? 999 : 100}
        />
    );
});

const MapComp: React.FC<MapCompProps> = ({ userLocation, places, onPlaceSelect, selectedPlaceId, activeTab, onClosePanel }) => {
  const defaultCenter: [number, number] = [48.8566, 2.3522];
  const popupRef = useRef<L.Popup>(null);

  // Force update popup position after render to fix first-click misalignment
  // Double trigger to ensure layout is caught
  useEffect(() => {
    if (selectedPlaceId && popupRef.current) {
        const timer1 = setTimeout(() => popupRef.current?.update(), 50);
        const timer2 = setTimeout(() => popupRef.current?.update(), 250); // Secondary check for slower devices
        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }
  }, [selectedPlaceId]);

  // Filter out places with invalid coordinates before doing anything else
  const validPlaces = places.filter(p => 
    p.properties && 
    isValidCoordinate(p.properties.lat, p.properties.lon)
  );

  // Derive selectedPlace from validPlaces to ensure we don't select a place with corrupt coordinates
  const selectedPlace = validPlaces.find(p => p.properties.place_id === selectedPlaceId);

  // Safety check for initial center to prevent crash
  const initialCenter = (userLocation && isValidCoordinate(userLocation.lat, userLocation.lng))
    ? [userLocation.lat, userLocation.lng] as [number, number] 
    : defaultCenter;

  return (
    <div className="w-full h-full relative">
        <style>
        {`
            /* Performance Optimizations for Mobile Smoothness */
            .leaflet-container {
                touch-action: pan-x pan-y;
                -ms-touch-action: pan-x pan-y;
                transition: none !important;
            }

            /* Custom Popup Overrides for Transparent/Floating Effect */
            .leaflet-popup-content-wrapper, .leaflet-popup-tip {
                background: transparent !important;
                box-shadow: none !important;
                border: none !important;
                padding: 0 !important;
                overflow: visible !important; /* Allow tail to stick out */
            }
            
            /* CRITICAL FIX: Enforce width on wrapper to prevent horizontal shift during render */
            .leaflet-popup-content {
                margin: 0 !important;
                width: 280px !important;
                max-width: 70vw !important;
                overflow: visible !important; /* Allow tail to stick out */
            }

            .leaflet-popup-close-button {
                display: none !important;
            }
            /* Disable default fade to let our component handle animation */
            .leaflet-fade-anim .leaflet-popup {
                transition: none !important;
            }
            
            /* CRITICAL FIX: Hide default tip container to fix vertical misalignment gap */
            .leaflet-popup-tip-container {
                display: none !important;
            }
        `}
        </style>
        <MapContainer
        center={initialCenter}
        zoom={14} /* Start close (Level 14) before animating out */
        style={{ height: '100%', width: '100%', background: 'transparent' }}
        zoomControl={false}
        className="outline-none"
        closePopupOnClick={false} /* IMPORTANT: We handle background clicks manually to sync React state */
        
        // Performance & Animation Configs
        zoomAnimation={true}
        markerZoomAnimation={true}
        fadeAnimation={true}
        inertia={true}
        inertiaDeceleration={3000}
        inertiaMaxSpeed={1500}
        zoomSnap={0.25}
        zoomDelta={0.5}
        preferCanvas={true}
        >
        <TileLayer
            attribution={MAP_ATTRIBUTION}
            url={MAP_TILE_URL}
            maxZoom={20}
        />
        
        {/* Listen for map clicks to close panel */}
        <MapClickHandler onClose={onClosePanel} />
        
        <ZoomControl position="bottomright" />
        <LocationCenterer position={userLocation} />
        <MapEffect selectedPlaceId={selectedPlaceId} places={validPlaces} userLocation={userLocation} />

        {userLocation && isValidCoordinate(userLocation.lat, userLocation.lng) && (
            <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={createCustomIcon(false, 'user')}
                zIndexOffset={1000}
                interactive={false} 
            />
        )}

        {validPlaces.map((place) => (
            <MemoizedMarker
                key={place.properties.place_id}
                place={place}
                isSelected={place.properties.place_id === selectedPlaceId}
                onPlaceSelect={onPlaceSelect}
            />
        ))}

        {/* Render Popup independently to ensure it sticks and behaves correctly */
         selectedPlace && isValidCoordinate(selectedPlace.properties.lat, selectedPlace.properties.lon) && (
            <Popup
               ref={popupRef}
               key={selectedPlace.properties.place_id}
               position={[selectedPlace.properties.lat, selectedPlace.properties.lon]}
               offset={[0, 10]} /* Centered over the marker (Visual adjustment) */
               closeButton={false}
               className="custom-popup"
               autoPan={true} /* Enable autoPan to fix overflow issues on small maps */
               autoPanPadding={[20, 20]}
            >
                <SpotInfoPanel 
                    place={selectedPlace} 
                    onClose={onClosePanel} 
                    userLocation={userLocation} 
                    activeTab={activeTab}
                />
            </Popup>
        )}

        </MapContainer>
    </div>
  );
};

export default MapComp;
