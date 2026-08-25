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
