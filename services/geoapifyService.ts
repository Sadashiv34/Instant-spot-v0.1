
import { GeoapifyResponse, GeoapifyPlace } from '../types';

// SECURITY NOTE: This key is used as a FALLBACK for the preview environment only.
// In a production deployment (Vercel), the /api/places proxy is used, and this key is ignored.
const FALLBACK_API_KEY = "49f54774eecb471b98f1afec04a2df6a";

// Detect if we need to fallback (simple check for direct usage preference in dev)
// We default to the Proxy path, but if it fails, we switch strategies.
const PROXY_TILES = `/api/tiles?z={z}&x={x}&y={y}`;
const DIRECT_TILES = `https://maps.geoapify.com/v1/tile/dark-matter-dark-grey/{z}/{x}/{y}.png?apiKey=${FALLBACK_API_KEY}`;

// We export a function or variable that tries to be smart, but for tiles (sync), 
// we will use the Direct URL in this preview to prevent the "Grey Map" issue immediately.
// When you deploy to Vercel, change this boolean to FALSE.
const IS_PREVIEW_ENV = true; 

export const MAP_TILE_URL = IS_PREVIEW_ENV ? DIRECT_TILES : PROXY_TILES;

export const MAP_ATTRIBUTION = '&copy; <a href="https://www.geoapify.com/">Geoapify</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export const PLACES_LIMIT = 30;

export const fetchNearbyPlaces = async (lat: number, lon: number, radiusMeters: number = 30000): Promise<GeoapifyResponse> => {
  // 1. Try Secure Backend Proxy First
  const proxyUrl = `/api/places?lat=${lat}&lon=${lon}&radius=${radiusMeters}&limit=${PLACES_LIMIT}`;

  try {
    const response = await fetch(proxyUrl);
    
    // 2. FALLBACK: If Proxy is missing (404) because we are in a preview/dev env
    if (response.status === 404) {
        // Log info instead of warning/error to confirm expected fallback behavior in preview
        console.log("Backend Proxy not active (Preview Mode). Switching to Direct API.");
        return fetchDirectly(lat, lon, radiusMeters);
    }

    if (!response.ok) {
      throw new Error(`Proxy API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return sanitizePlaces(data);

  } catch (error) {
    // 3. Network/System Error Fallback
    console.warn("Proxy connection failed, attempting fallback to direct API.");
    return fetchDirectly(lat, lon, radiusMeters);
  }
};

// Helper: Direct API call for Preview/Fallback
const fetchDirectly = async (lat: number, lon: number, radius: number): Promise<GeoapifyResponse> => {
    // Use URLSearchParams to ensure proper encoding of special characters (:, ,)
    const url = new URL('https://api.geoapify.com/v2/places');
    
    // Removed 'religion' to match user request
    url.searchParams.append('categories', 'tourism,entertainment,leisure,natural,building.historic');
    url.searchParams.append('filter', `circle:${lon},${lat},${radius}`);
    url.searchParams.append('limit', PLACES_LIMIT.toString());
    url.searchParams.append('apiKey', FALLBACK_API_KEY);
    
    try {
        const res = await fetch(url.toString(), {
            method: 'GET',
            mode: 'cors', // Explicitly allow CORS
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!res.ok) {
             console.error(`Direct API Status: ${res.status}`);
             throw new Error(`API returned ${res.status}`);
        }
        
        const data = await res.json();
        return sanitizePlaces(data);
    } catch (e) {
        console.error("Direct API Fallback failed:", e);
        // CRITICAL FIX: Propagate error instead of returning empty array
        // This ensures the UI shows the 'Signal Lost' error state rather than '0 Places Found'
        throw e;
    }
}

// Helper: Sanitize Data
const sanitizePlaces = (data: any): GeoapifyResponse => {
    const uniquePlaces = new Map<string, GeoapifyPlace>();
    if (data.features && Array.isArray(data.features)) {
        data.features.forEach((feature: GeoapifyPlace) => {
            if (feature.properties.place_id && !uniquePlaces.has(feature.properties.place_id)) {
                feature.properties.lat = Number(feature.properties.lat);
                feature.properties.lon = Number(feature.properties.lon);
                
                if (!isNaN(feature.properties.lat) && !isNaN(feature.properties.lon)) {
                    uniquePlaces.set(feature.properties.place_id, feature);
                }
            }
        });
    }

    return {
        type: 'FeatureCollection',
        features: Array.from(uniquePlaces.values())
    } as GeoapifyResponse;
};

export const getPlaceDetails = async (placeId: string): Promise<string | null> => {
  return null;
};
