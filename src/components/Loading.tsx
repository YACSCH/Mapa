import './Loading.css';

export function Loading() {
  return (
    <div className="loading">
      <div className="loading__spinner" />
      <span className="loading__text">Calculando ruta...</span>
    </div>
  );
}
