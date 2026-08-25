import type { GeocodedLocation } from '../types';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

function getCountryCode(): string | undefined {
  const code = import.meta.env.VITE_COUNTRY_CODE;
  if (code && typeof code === 'string' && code.trim().length > 0) {
    return code.trim().toLowerCase();
  }
  return undefined;
}

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

  const countryCode = getCountryCode();
  if (countryCode) {
    params.set('countrycodes', countryCode);
  }

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

export async function searchAddresses(
  query: string,
  signal?: AbortSignal
): Promise<GeocodedLocation[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '5',
    addressdetails: '1',
  });

  const countryCode = getCountryCode();
  if (countryCode) {
    params.set('countrycodes', countryCode);
  }

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    signal,
    headers: {
      'Accept-Language': 'es',
      'User-Agent': 'MapaTarifa/1.0 (calculadora-tarifa)',
    },
  });

  if (!response.ok) {
    return [];
  }

  const results = await response.json();

  if (!Array.isArray(results)) {
    return [];
  }

  return results.map(
    (result): GeocodedLocation => ({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
    })
  );
}
