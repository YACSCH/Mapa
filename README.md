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
