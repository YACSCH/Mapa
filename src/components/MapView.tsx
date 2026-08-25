import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeoPoint } from '../types';
import './MapView.css';

const defaultPosition: GeoPoint = { lat: -33.4489, lng: -70.6693 };

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapUpdaterProps {
  origin: GeoPoint | null;
  destination: GeoPoint | null;
  routeGeometry: GeoPoint[];
}

function MapUpdater({ origin, destination, routeGeometry }: MapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    if (origin && destination) {
      const bounds = L.latLngBounds(
        [origin.lat, origin.lng],
        [destination.lat, destination.lng]
      );
      if (routeGeometry.length > 0) {
        routeGeometry.forEach((point) => {
          bounds.extend([point.lat, point.lng]);
        });
      }
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (origin) {
      map.setView([origin.lat, origin.lng], 13);
    }
  }, [origin, destination, routeGeometry, map]);

  return null;
}

interface MapViewProps {
  origin: GeoPoint | null;
  destination: GeoPoint | null;
  routeGeometry: GeoPoint[];
}

export function MapView({ origin, destination, routeGeometry }: MapViewProps) {
  return (
    <div className="map-container">
      <MapContainer
        center={[defaultPosition.lat, defaultPosition.lng]}
        zoom={12}
        className="map-container__map"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater
          origin={origin}
          destination={destination}
          routeGeometry={routeGeometry}
        />
        {origin && (
          <Marker
            position={[origin.lat, origin.lng]}
            icon={defaultIcon}
          />
        )}
        {destination && (
          <Marker
            position={[destination.lat, destination.lng]}
            icon={defaultIcon}
          />
        )}
        {routeGeometry.length > 0 && (
          <Polyline
            positions={routeGeometry.map((p) => [p.lat, p.lng])}
            pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.8 }}
          />
        )}
      </MapContainer>
    </div>
  );
}
