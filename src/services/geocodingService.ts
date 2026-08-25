import type { GeocodedLocation } from '../types';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function geocode(
  address: string,
  signal?: AbortSignal
): Promise<GeocodedLocation> {
  const params = new URLSearchParams({
    q: address,
    format: 'json',
    limit: '1',
    addressdetails: '1',
  });

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    signal,
    headers: {
      'Accept-Language': 'es',
      'User-Agent': 'MapaTarifa/1.0 (calculadora-tarifa)',
    },
  });

  if (!response.ok) {
    throw new Error(`Error de geocodificación: ${response.status}`);
  }

  const results = await response.json();

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('No fue posible encontrar la dirección ingresada.');
  }

  const result = results[0];

  return {
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    displayName: result.display_name,
  };
}
