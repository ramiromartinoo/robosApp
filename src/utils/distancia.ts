export type Punto = { latitud: number; longitud: number };

const RADIO_DE_LA_TIERRA_M = 6371000;
const aRadianes = (grados: number) => (grados * Math.PI) / 180;

// Distancia en metros entre dos puntos (fórmula de haversine)
export function distanciaEnMetros(a: Punto, b: Punto): number {
  const dLat = aRadianes(b.latitud - a.latitud);
  const dLng = aRadianes(b.longitud - a.longitud);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(a.latitud)) * Math.cos(aRadianes(b.latitud)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_DE_LA_TIERRA_M * Math.asin(Math.sqrt(h));
}

// "a 500 metros de ti", "a 1200 metros de ti", "a 12 km de ti".
// Se redondea a 100 m: la ubicación de los reportes es aproximada, más precisión sería engañosa.
export function distanciaLegible(metros: number): string {
  if (metros < 100) {
    return 'a menos de 100 metros de ti';
  }
  if (metros < 5000) {
    return `a ${Math.round(metros / 100) * 100} metros de ti`;
  }
  return `a ${Math.round(metros / 1000)} km de ti`;
}
