import type { GeoPoint, RouteResult } from '../types';

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

export async function getRoute(
  origin: GeoPoint,
  destination: GeoPoint,
  signal?: AbortSignal
): Promise<RouteResult> {
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = `${OSRM_URL}/${coords}?overview=full&geometries=geojson&steps=false`;

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Error de routing: ${response.status}`);
  }

  const data = await response.json();

  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error('No fue posible calcular la ruta.');
  }

  const route = data.routes[0];
  const distanceMeters = route.distance;
  const distanceKm = distanceMeters / 1000;

  const geometry = route.geometry.coordinates.map(
    (coord: [number, number]): GeoPoint => ({
      lng: coord[0],
      lat: coord[1],
    })
  );

  return {
    distanceMeters,
    distanceKm,
    geometry,
  };
}
