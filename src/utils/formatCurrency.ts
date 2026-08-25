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
