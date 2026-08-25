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
