import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { Punto } from './distancia';

// Ubicación actual del usuario, para calcular a qué distancia ocurrió cada reporte.
// Queda en null si no dio permiso o no se pudo obtener: la app tiene que funcionar igual sin ella.
// La distancia se calcula en el teléfono. La ubicación solo viaja al servidor, redondeada,
// cuando el usuario activa el filtro "cerca de mí" (ver FeedScreen).
export function useMiUbicacion(): { miUbicacion: Punto | null; actualizar: () => Promise<Punto | null> } {
  const [miUbicacion, setMiUbicacion] = useState<Punto | null>(null);

  // devuelve la ubicación obtenida, o null si no se pudo
  const actualizar = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }
      // la última conocida llega al instante; después se corrige con la actual
      const ultima = await Location.getLastKnownPositionAsync();
      if (ultima) {
        setMiUbicacion({ latitud: ultima.coords.latitude, longitud: ultima.coords.longitude });
      }
      const posicion = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const actual = { latitud: posicion.coords.latitude, longitud: posicion.coords.longitude };
      setMiUbicacion(actual);
      return actual;
    } catch {
      // sin ubicación: se muestra la zona en vez de la distancia
      return null;
    }
  }, []);

  useEffect(() => {
    actualizar();
  }, [actualizar]);

  return { miUbicacion, actualizar };
}
