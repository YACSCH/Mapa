import type { GeocodedLocation } from '../types';

const PHOTON_URL = 'https://photon.komoot.io/api/';

interface PhotonProperties {
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  [key: string]: unknown;
}

interface PhotonFeature {
  geometry: {
    coordinates: [number, number];
  };
  properties: PhotonProperties;
}

function formatLabel(props: PhotonProperties): string {
  const parts: string[] = [];
  if (props.name) parts.push(props.name);
  if (props.city) parts.push(props.city);
  if (props.state) parts.push(props.state);
  if (props.country) parts.push(props.country);
  return parts.join(', ') || 'Dirección desconocida';
}

export async function geocode(
  address: string,
  signal?: AbortSignal
): Promise<GeocodedLocation> {
  const params = new URLSearchParams({
    q: address,
    limit: '1',
  });

  const response = await fetch(`${PHOTON_URL}?${params.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Error de geocodificación: ${response.status}`);
  }

  const data = await response.json();

  if (!data.features || data.features.length === 0) {
    throw new Error('No fue posible encontrar la dirección ingresada.');
  }

  const feature: PhotonFeature = data.features[0];
  const [lng, lat] = feature.geometry.coordinates;

  return {
    lat,
    lng,
    displayName: formatLabel(feature.properties),
  };
}
