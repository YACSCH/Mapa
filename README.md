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
VITE_COUNTRY_CODE=cl
```

- `VITE_TARIFA_200_METROS` — cuántos pesos cuestan los primeros 200 metros (un bloque).
- `VITE_COUNTRY_CODE` — código de país ISO 3166-1 alpha-2 para limitar las búsquedas (ej: `cl` = Chile, `mx` = México, `ar` = Argentina). Si se omite, busca en todo el mundo.

## Ejecutar

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Cambiar la tarifa o el país

Modificar los valores en el archivo `.env`:

```
VITE_TARIFA_200_METROS=800
VITE_COUNTRY_CODE=mx
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
