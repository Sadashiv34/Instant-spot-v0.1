
export interface GeoapifyPlace {
  properties: {
    name: string;
    formatted: string;
    categories: string[];
    lat: number;
    lon: number;
    place_id: string;
    address_line1?: string;
    address_line2?: string;
    distance?: number;
    website?: string;
    contact?: {
      phone?: string;
    };
    datasource?: {
        raw?: {
            rating?: number;
            opening_hours?: string;
        }
    }
  };
  geometry: {
    coordinates: [number, number]; // lon, lat
  };
}

export interface GeoapifyResponse {
  type: string;
  features: GeoapifyPlace[];
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export enum Tab {
  NONE = 'None',
  DETAILS = 'Details',
  REVIEW = 'Reviews',
  GUIDE = 'Guide'
}
