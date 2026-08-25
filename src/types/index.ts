export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeocodedLocation {
  lat: number;
  lng: number;
  displayName: string;
}

export interface RouteResult {
  distanceMeters: number;
  distanceKm: number;
  geometry: GeoPoint[];
}

export interface FareResult {
  distanceMeters: number;
  blocks: number;
  ratePerBlock: number;
  total: number;
}
