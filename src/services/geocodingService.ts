import type { GeocodedLocation } from '../types';

export async function geocode(
  _address: string,
  _signal?: AbortSignal
): Promise<GeocodedLocation> {
  throw new Error('Servicio de geocodificación no configurado.');
}
