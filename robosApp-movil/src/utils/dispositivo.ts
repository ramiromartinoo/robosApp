import * as SecureStore from 'expo-secure-store';

const CLAVE = 'id-de-instalacion';

// Identificador de esta instalación de la app, para que el backend detecte varias cuentas usadas
// desde un mismo teléfono. Se genera al azar la primera vez y queda guardado en el almacenamiento
// seguro del sistema. No identifica a la persona ni al teléfono fuera de la app.
let pedido: Promise<string> | null = null;

export function obtenerIdDeDispositivo(): Promise<string> {
  // se calcula una sola vez por sesión, aunque lo pidan varios pedidos a la vez
  pedido ??= leerOCrear();
  return pedido;
}

async function leerOCrear(): Promise<string> {
  try {
    const guardado = await SecureStore.getItemAsync(CLAVE);
    if (guardado) {
      return guardado;
    }
    const nuevo = generar();
    await SecureStore.setItemAsync(CLAVE, nuevo);
    return nuevo;
  } catch {
    // si el almacenamiento falla, se usa uno temporal: la app tiene que seguir funcionando
    return generar();
  }
}

// 32 caracteres hexadecimales en grupos, del estilo "3f2a9c1e-…"
function generar(): string {
  const hex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
