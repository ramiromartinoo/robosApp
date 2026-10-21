import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { distanciaEnMetros, Punto } from './distancia';

// Cuánto hay entre el teléfono y el lugar del reporte, en metros, al momento de publicar.
// Es un dato interno para moderar: un reporte cargado muy lejos del lugar no es necesariamente falso,
// pero ayuda a evaluarlo si lo denuncian. No pide permiso ni espera al GPS: si no hay una posición
// reciente, devuelve null. La ubicación del teléfono no se envía; solo la distancia.
export async function distanciaDesdeElTelefono(lugar: Punto): Promise<number | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
    const posicion = await Location.getLastKnownPositionAsync({ maxAge: 10 * 60 * 1000 });
    if (!posicion) {
      return null;
    }
    const telefono = { latitud: posicion.coords.latitude, longitud: posicion.coords.longitude };
    return Math.round(distanciaEnMetros(telefono, lugar));
  } catch {
    return null;
  }
}

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
