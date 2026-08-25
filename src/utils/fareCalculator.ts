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
