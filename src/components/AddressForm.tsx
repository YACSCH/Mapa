import { useState } from 'react';
import { AddressInput } from './AddressInput';
import type { GeocodedLocation } from '../types';
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
        <AddressInput
          id="origin"
          placeholder="Ingrese dirección de origen"
          value={origin}
          onChange={setOrigin}
          onSelect={(_loc: GeocodedLocation) => {}}
          disabled={isLoading}
        />
      </div>

      <div className="address-form__field">
        <label className="address-form__label" htmlFor="destination">
          Destino
        </label>
        <AddressInput
          id="destination"
          placeholder="Ingrese dirección de destino"
          value={destination}
          onChange={setDestination}
          onSelect={(_loc: GeocodedLocation) => {}}
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
