# Distance Fare Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React + TypeScript frontend app that calculates fares based on real driving distance between two addresses using Leaflet, Nominatim, and OSRM.

**Architecture:** Services layer (geocoding, routing) feeds into a pure fare calculator utility. React components handle UI display. Map updates reactively via React-Leaflet. All state in App.tsx using useState/useEffect.

**Tech Stack:** React 18, TypeScript, Vite, Leaflet.js, React-Leaflet, Vanilla CSS, Nominatim API, OSRM API

## Global Constraints

- 100% frontend, no backend, no database
- No localStorage/sessionStorage
- Vanilla CSS (plain .css files, BEM-style class names)
- Currency format: `Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })`
- Blocks: `Math.ceil(distanceMeters / 200)`
- Env var: `VITE_TARIFA_200_METROS`
- Error messages in Spanish
- All fetch calls use AbortController for cancellation

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `.env`
- Create: `.env.example`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "mapa-tarifa",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "leaflet": "^1.9.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-leaflet": "^4.2.1"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.8",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.2"
  }
}
```

- [ ] **Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Calculadora de Tarifa por Distancia</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      crossorigin=""
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create .env**

```
VITE_TARIFA_200_METROS=500
```

- [ ] **Step 7: Create .env.example**

```
VITE_TARIFA_200_METROS=500
```

- [ ] **Step 8: Install dependencies and verify**

Run: `npm install`
Expected: Dependencies installed successfully

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/types/index.ts`

**Interfaces:**
- Produces: `GeoPoint`, `GeocodedLocation`, `RouteResult`, `FareResult`

- [ ] **Step 1: Create src/types/index.ts**

```typescript
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
```

- [ ] **Step 2: Create src/main.tsx**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## Task 3: Fare Calculator Utility

**Files:**
- Create: `src/utils/fareCalculator.ts`

**Interfaces:**
- Consumes: `FareResult` from `src/types/index.ts`
- Produces: `calculateFare(distanceMeters: number, ratePer200Meters: number): FareResult`
- Produces: `getTarifa(): number`

- [ ] **Step 1: Create src/utils/fareCalculator.ts**

```typescript
import type { FareResult } from '../types';

export function getTarifa(): number {
  const raw = import.meta.env.VITE_TARIFA_200_METROS;
  if (raw === undefined || raw === null || raw === '') {
    throw new Error('Error: Tarifa no configurada. Defina VITE_TARIFA_200_METROS en el archivo .env');
  }
  const value = Number(raw);
  if (isNaN(value) || value <= 0) {
    throw new Error('Error: Tarifa inválida. VITE_TARIFA_200_METROS debe ser un número positivo.');
  }
  return value;
}

export function calculateFare(distanceMeters: number, ratePer200Meters: number): FareResult {
  if (distanceMeters < 0) {
    throw new Error('La distancia no puede ser negativa.');
  }
  if (ratePer200Meters <= 0) {
    throw new Error('La tarifa debe ser un número positivo.');
  }

  const blocks = Math.ceil(distanceMeters / 200);
  const total = blocks * ratePer200Meters;

  return {
    distanceMeters,
    blocks,
    ratePerBlock: ratePer200Meters,
    total,
  };
}
```

---

## Task 4: Geocoding Service

**Files:**
- Create: `src/services/geocodingService.ts`

**Interfaces:**
- Consumes: `GeoPoint`, `GeocodedLocation` from `src/types/index.ts`
- Produces: `geocode(address: string, signal?: AbortSignal): Promise<GeocodedLocation>`

- [ ] **Step 1: Create src/services/geocodingService.ts**

```typescript
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
```

---

## Task 5: Routing Service

**Files:**
- Create: `src/services/routingService.ts`

**Interfaces:**
- Consumes: `GeoPoint`, `RouteResult` from `src/types/index.ts`
- Produces: `getRoute(origin: GeoPoint, destination: GeoPoint, signal?: AbortSignal): Promise<RouteResult>`

- [ ] **Step 1: Create src/services/routingService.ts**

```typescript
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
```

---

## Task 6: Utility — Format Currency

**Files:**
- Create: `src/utils/formatCurrency.ts`

- [ ] **Step 1: Create src/utils/formatCurrency.ts**

```typescript
const formatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return formatter.format(value);
}

export function formatMeters(meters: number): string {
  return `${Math.round(meters).toLocaleString('es-CL')} metros`;
}
```

---

## Task 7: Loading Component

**Files:**
- Create: `src/components/Loading.tsx`
- Create: `src/components/Loading.css`

- [ ] **Step 1: Create src/components/Loading.tsx**

```tsx
import './Loading.css';

export function Loading() {
  return (
    <div className="loading">
      <div className="loading__spinner" />
      <span className="loading__text">Calculando ruta...</span>
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/Loading.css**

```css
.loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
}

.loading__spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e0e0e0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading__text {
  font-size: 14px;
  color: #6b7280;
}
```

---

## Task 8: AddressForm Component

**Files:**
- Create: `src/components/AddressForm.tsx`
- Create: `src/components/AddressForm.css`

**Interfaces:**
- Consumes: none
- Produces: `onCalculate(origin: string, destination: string)` callback

- [ ] **Step 1: Create src/components/AddressForm.tsx**

```tsx
import { useState } from 'react';
import './AddressForm.css';

interface AddressFormProps {
  onCalculate: (origin: string, destination: string) => void;
  isLoading: boolean;
}

export function AddressForm({ onCalculate, isLoading }: AddressFormProps) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(origin.trim(), destination.trim());
  };

  return (
    <form className="address-form" onSubmit={handleSubmit}>
      <div className="address-form__field">
        <label className="address-form__label" htmlFor="origin">
          Origen
        </label>
        <input
          id="origin"
          className="address-form__input"
          type="text"
          placeholder="Ingrese dirección de origen"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="address-form__field">
        <label className="address-form__label" htmlFor="destination">
          Destino
        </label>
        <input
          id="destination"
          className="address-form__input"
          type="text"
          placeholder="Ingrese dirección de destino"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <button
        className="address-form__button"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? 'Calculando...' : 'Calcular Distancia'}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Create src/components/AddressForm.css**

```css
.address-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.address-form__label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.address-form__input {
  padding: 12px 14px;
  font-size: 15px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}

.address-form__input:focus {
  border-color: #2563eb;
}

.address-form__input:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.address-form__button {
  padding: 14px 24px;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  background-color: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: background-color 0.2s;
}

.address-form__button:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.address-form__button:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}
```

---

## Task 9: CalculationResult Component

**Files:**
- Create: `src/components/CalculationResult.tsx`
- Create: `src/components/CalculationResult.css`

**Interfaces:**
- Consumes: `FareResult` from types, `formatCurrency` and `formatMeters` from utils

- [ ] **Step 1: Create src/components/CalculationResult.tsx**

```tsx
import type { FareResult } from '../types';
import { formatCurrency, formatMeters } from '../utils/formatCurrency';
import './CalculationResult.css';

interface CalculationResultProps {
  result: FareResult;
}

export function CalculationResult({ result }: CalculationResultProps) {
  return (
    <div className="result">
      <div className="result__row">
        <span className="result__label">Distancia</span>
        <span className="result__value">{formatMeters(result.distanceMeters)}</span>
      </div>

      <div className="result__row">
        <span className="result__label">Bloques</span>
        <span className="result__value">
          {result.blocks} {result.blocks === 1 ? 'bloque' : 'bloques'} de 200 metros
        </span>
      </div>

      <div className="result__row">
        <span className="result__label">Tarifa por bloque</span>
        <span className="result__value">{formatCurrency(result.ratePerBlock)}</span>
      </div>

      <div className="result__total">
        <span className="result__total-label">TOTAL</span>
        <span className="result__total-value">{formatCurrency(result.total)}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/CalculationResult.css**

```css
.result {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background-color: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
}

.result__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result__label {
  font-size: 14px;
  color: #64748b;
}

.result__value {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.result__total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  margin-top: 4px;
  border-top: 2px solid #cbd5e1;
}

.result__total-label {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  text-transform: uppercase;
}

.result__total-value {
  font-size: 28px;
  font-weight: 800;
  color: #2563eb;
}
```

---

## Task 10: MapView Component

**Files:**
- Create: `src/components/MapView.tsx`
- Create: `src/components/MapView.css`

**Interfaces:**
- Consumes: `GeoPoint` from types

- [ ] **Step 1: Create src/components/MapView.tsx**

```tsx
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeoPoint } from '../types';
import './MapView.css';

const defaultPosition: GeoPoint = { lat: -33.4489, lng: -70.6693 };

const originIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const destinationIcon = new L.Icon({
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
            icon={originIcon}
          />
        )}
        {destination && (
          <Marker
            position={[destination.lat, destination.lng]}
            icon={destinationIcon}
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
```

- [ ] **Step 2: Create src/components/MapView.css**

```css
.map-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}

.map-container__map {
  width: 100%;
  height: 100%;
}
```

---

## Task 11: App Component — Main Layout

**Files:**
- Create: `src/App.tsx`
- Create: `src/App.css`

**Interfaces:**
- Consumes: AddressForm, MapView, CalculationResult, Loading, geocode, getRoute, calculateFare, getTarifa

- [ ] **Step 1: Create src/App.tsx**

```tsx
import { useState, useRef, useCallback } from 'react';
import { AddressForm } from './components/AddressForm';
import { MapView } from './components/MapView';
import { CalculationResult } from './components/CalculationResult';
import { Loading } from './components/Loading';
import { geocode } from './services/geocodingService';
import { getRoute } from './services/routingService';
import { calculateFare, getTarifa } from './utils/fareCalculator';
import type { GeoPoint, FareResult } from './types';
import './App.css';

export default function App() {
  const [result, setResult] = useState<FareResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [origin, setOrigin] = useState<GeoPoint | null>(null);
  const [destination, setDestination] = useState<GeoPoint | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<GeoPoint[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const handleCalculate = useCallback(
    async (originAddress: string, destinationAddress: string) => {
      if (!originAddress) {
        setError('Debe ingresar una dirección de origen.');
        return;
      }
      if (!destinationAddress) {
        setError('Debe ingresar una dirección de destino.');
        return;
      }

      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const tarifa = getTarifa();

        const [originLocation, destinationLocation] = await Promise.all([
          geocode(originAddress, controller.signal),
          geocode(destinationAddress, controller.signal),
        ]);

        if (controller.signal.aborted) return;

        setOrigin(originLocation);
        setDestination(destinationLocation);

        const route = await getRoute(originLocation, destinationLocation, controller.signal);

        if (controller.signal.aborted) return;

        setRouteGeometry(route.geometry);

        const fareResult = calculateFare(route.distanceMeters, tarifa);
        setResult(fareResult);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Ocurrió un error inesperado.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Calculadora de Tarifa</h1>
      </header>

      <main className="app__main">
        <aside className="app__sidebar">
          <AddressForm onCalculate={handleCalculate} isLoading={isLoading} />

          {error && (
            <div className="app__error">
              {error}
            </div>
          )}

          {isLoading && <Loading />}

          {result && <CalculationResult result={result} />}
        </aside>

        <section className="app__map-section">
          <MapView
            origin={origin}
            destination={destination}
            routeGeometry={routeGeometry}
          />
        </section>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create src/App.css**

```css
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f1f5f9;
}

.app__header {
  background-color: #1e293b;
  color: #ffffff;
  padding: 16px 24px;
}

.app__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.app__main {
  flex: 1;
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 0;
  overflow: hidden;
}

.app__sidebar {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
}

.app__map-section {
  position: relative;
}

.app__error {
  padding: 12px 16px;
  background-color: #fef2f2;
  border: 2px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .app__main {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .app__sidebar {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }

  .app__map-section {
    min-height: 400px;
  }
}
```

---

## Task 12: Global Styles + README

**Files:**
- Create: `src/index.css`
- Create: `README.md`

- [ ] **Step 1: Create src/index.css**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f1f5f9;
  color: #1e293b;
}

#root {
  min-height: 100vh;
}
```

- [ ] **Step 2: Create README.md**

```markdown
# Calculadora de Tarifa por Distancia

Aplicación web para calcular tarifas basadas en la distancia real por calles entre dos direcciones.

## Tecnologías

- React 18 + TypeScript
- Vite
- Leaflet.js + React-Leaflet
- OpenStreetMap / Nominatim (geocodificación)
- OSRM (routing)

## Instalación

```bash
npm install
```

## Configurar tarifa

Crear un archivo `.env` en la raíz del proyecto:

```
VITE_TARIFA_200_METROS=500
```

El valor indica cuántos pesos cuestan los primeros 200 metros (un bloque).

## Ejecutar

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Cambiar la tarifa

Modificar el valor de `VITE_TARIFA_200_METROS` en el archivo `.env`:

```
VITE_TARIFA_200_METROS=800
```

Reiniciar el servidor de desarrollo para que el cambio tome efecto.

## Cálculo

```
bloques = Math.ceil(distanciaMetros / 200)
total = bloques × tarifaPorBloque
```

## Build

```bash
npm run build
```

Los archivos estáticos se generan en la carpeta `dist/`.
```

---

## Task 13: Build Verification

- [ ] **Step 1: Run dev server and verify**

Run: `npm run dev`
Expected: Server starts without errors on http://localhost:5173

- [ ] **Step 2: Build production**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

---

## Spec Coverage

| Spec Requirement | Task |
|---|---|
| Project scaffolding (Vite + React + TS) | Task 1 |
| TypeScript types | Task 2 |
| Fare calculator (pure function) | Task 3 |
| Geocoding service (Nominatim) | Task 4 |
| Routing service (OSRM) | Task 5 |
| Currency formatting (es-CL) | Task 6 |
| Loading component | Task 7 |
| AddressForm component | Task 8 |
| CalculationResult component | Task 9 |
| MapView component (Leaflet + React-Leaflet) | Task 10 |
| App layout (2-column responsive) | Task 11 |
| Global styles + README | Task 12 |
| Build verification | Task 13 |
| .env + .env.example | Task 1 |
| Error handling (all cases) | Tasks 3, 4, 5, 11 |
| AbortController cancellation | Tasks 4, 5, 11 |
| fitBounds on map | Task 10 |
| Spanish error messages | Tasks 3, 4, 5, 11 |
