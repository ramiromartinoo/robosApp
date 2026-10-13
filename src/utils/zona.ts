import * as Location from 'expo-location';

const LARGO_MAXIMO = 80;

// Convierte una coordenada en una referencia aproximada para mostrar en el feed, por ejemplo
// "Av. Colón al 2300". La altura se redondea a la centena: se muestra la cuadra, nunca el número exacto.
// Devuelve null si no se pudo averiguar (sin permiso de ubicación, sin conexión, zona sin calles...).
export async function obtenerZona(latitud: number, longitud: number): Promise<string | null> {
  try {
    const [direccion] = await Location.reverseGeocodeAsync({ latitude: latitud, longitude: longitud });
    if (!direccion) {
      return null;
    }

    let zona: string | null = null;
    if (direccion.street) {
      const altura = Number.parseInt(direccion.streetNumber ?? '', 10);
      zona = altura >= 100 ? `${direccion.street} al ${Math.floor(altura / 100) * 100}` : direccion.street;
    }
    // el barrio suma contexto; si no hay calle, es lo único que se muestra
    if (direccion.district && direccion.district !== direccion.street) {
      zona = zona ? `${zona}, ${direccion.district}` : direccion.district;
    }
    return zona ? zona.slice(0, LARGO_MAXIMO) : null;
  } catch {
    return null;
  }
}
