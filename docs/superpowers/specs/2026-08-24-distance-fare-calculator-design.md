# Distance Fare Calculator — Design Spec

## Overview

A 100% frontend React + TypeScript application that calculates a fare based on real driving distance between two addresses. Uses Leaflet.js with OpenStreetMap for mapping, Nominatim for geocoding, and OSRM for route calculation.

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Leaflet.js + React-Leaflet (map)
- Vanilla CSS (plain .css files, BEM-style naming)
- Nominatim (geocoding API)
- OSRM (routing API)

No backend, no database, no localStorage/sessionStorage.

## Architecture

```
src/
├── components/
│   ├── AddressForm.tsx       # Origin/destination inputs + calculate button
│   ├── MapView.tsx           # Leaflet map with markers and polyline
│   ├── CalculationResult.tsx # Fare breakdown display
│   └── Loading.tsx           # Loading spinner/text
├── services/
│   ├── geocodingService.ts   # Nominatim geocoding (swappable)
│   └── routingService.ts     # OSRM routing (swappable)
├── utils/
│   └── fareCalculator.ts     # Pure fare calculation function
├── types/
│   └── index.ts              # Shared TypeScript types
├── App.tsx                   # Main layout, state management
├── main.tsx                  # Entry point
└── index.css                 # Global styles
```

## Data Flow

```
User input (origin, destination)
    → geocodingService.geocode(address) → { lat, lng }
    → routingService.getRoute(origin, destination) → { distanceMeters, geometry }
    → fareCalculator.calculateFare(distanceMeters, ratePer200Meters)
    → { distanceMeters, blocks, ratePerBlock, total }
    → Display results + update map
```

## Services

### geocodingService.ts

- Interface: `geocode(address: string): Promise<GeocodedLocation>`
- Implementation: Nominatim API (`https://nominatim.openstreetmap.org/search`)
- Returns: `{ lat: number, lng: number, displayName: string }`
- Throws on: network error, no results, multiple results (takes first)

### routingService.ts

- Interface: `getRoute(origin: GeoPoint, destination: GeoPoint): Promise<RouteResult>`
- Implementation: OSRM public API (`https://router.project-osrm.org/route/v1/driving/`)
- Returns: `{ distanceMeters: number, distanceKm: number, geometry: GeoPoint[] }`
- Throws on: network error, no route found

Both services are designed with a simple function interface — swapping to different providers later means replacing the implementation, not the consumers.

## fareCalculator.ts

Pure function, no side effects:

```typescript
interface FareResult {
  distanceMeters: number;
  blocks: number;
  ratePerBlock: number;
  total: number;
}

function calculateFare(distanceMeters: number, ratePer200Meters: number): FareResult
```

- `blocks = Math.ceil(distanceMeters / 200)`
- `total = blocks * ratePer200Meters`

## Environment Variables

`.env`:
```
VITE_TARIFA_200_METROS=500
```

Read via `import.meta.env.VITE_TARIFA_200_METROS`. Validated at app startup — if missing or invalid, show error message and disable calculation.

## UI Layout

Two-column responsive layout:

**Left column:** AddressForm (inputs + button) + CalculationResult
**Right column:** MapView (full height)

On mobile: stacks vertically (form on top, map below).

### States

1. **Initial:** Empty form, map centered on default location (Santiago, Chile)
2. **Loading:** "Calculando ruta..." text, button disabled
3. **Result:** Distance, blocks, rate, total displayed. Map shows route with markers and fitBounds.
4. **Error:** Friendly error message displayed below form

## Validation

- Empty origin → "Debe ingresar una dirección de origen."
- Empty destination → "Debe ingresar una dirección de destino."
- Geocoding failure → "No fue posible encontrar la dirección ingresada."
- Routing failure → "No fue posible calcular la ruta."
- Invalid env var → "Error: Tarifa no configurada."

## Currency Format

Chilean peso format using `Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })`.

## Error Handling

- All fetch calls wrapped in try/catch
- AbortController for request cancellation (prevent duplicate requests)
- HTTP status validation on responses
- JSON parse validation
- User-friendly Spanish error messages

## State Management

React hooks only: `useState`, `useEffect`, `useMemo`. No external state library.

## Constraints

- 100% frontend, no backend
- No database, no persistence
- No login/auth
- No localStorage/sessionStorage
