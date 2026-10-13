import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { Punto } from './distancia';

// Ubicación actual del usuario, para calcular a qué distancia ocurrió cada reporte.
// Queda en null si no dio permiso o no se pudo obtener: la app tiene que funcionar igual sin ella.
// La ubicación se usa solo en el teléfono; no se envía al servidor.
export function useMiUbicacion(): { miUbicacion: Punto | null; actualizar: () => Promise<void> } {
  const [miUbicacion, setMiUbicacion] = useState<Punto | null>(null);

  const actualizar = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      // la última conocida llega al instante; después se corrige con la actual
      const ultima = await Location.getLastKnownPositionAsync();
      if (ultima) {
        setMiUbicacion({ latitud: ultima.coords.latitude, longitud: ultima.coords.longitude });
      }
      const actual = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setMiUbicacion({ latitud: actual.coords.latitude, longitud: actual.coords.longitude });
    } catch {
      // sin ubicación: se muestra la zona en vez de la distancia
    }
  }, []);

  useEffect(() => {
    actualizar();
  }, [actualizar]);

  return { miUbicacion, actualizar };
}
