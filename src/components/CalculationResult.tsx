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
