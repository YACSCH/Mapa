import type { GeocodedLocation } from '../types';

export async function geocode(
  _address: string,
  _signal?: AbortSignal
): Promise<GeocodedLocation> {
  throw new Error('Servicio de geocodificación no configurado.');
}

export async function searchAddresses(
  _query: string,
  _signal?: AbortSignal
): Promise<GeocodedLocation[]> {
  return [];
}
