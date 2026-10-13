// Único lugar que sabe cómo hablarle al backend: dirección, token y manejo de errores

import Constants from 'expo-constants';

const PUERTO_DEL_BACKEND = 8080;
const ESPERA_MAXIMA_MS = 10000;

// En desarrollo el backend corre en la misma PC que Expo, así que su IP es la misma desde la que
// el celular bajó la app. Detectarla evita tener que corregirla a mano cada vez que el router la cambia.
function urlDetectada(): string | undefined {
  // hostUri tiene la forma "192.168.1.78:8081"
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  // solo sirve si es una IP de la red local (con --tunnel es un dominio que no llega al backend)
  return host && /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ? `http://${host}:${PUERTO_DEL_BACKEND}` : undefined;
}

// Si EXPO_PUBLIC_API_URL está definida, manda (hace falta con --tunnel o con un backend en otro equipo)
const API_URL = process.env.EXPO_PUBLIC_API_URL || urlDetectada();
// PROVISORIO: token fijo de prueba hasta que esté el login con Google
const TOKEN = process.env.EXPO_PUBLIC_DEV_TOKEN;

export class ErrorDeApi extends Error {
  // código HTTP, o 0 si ni siquiera se pudo conectar
  status: number;
  // errores de validación por campo (ej. { descripcion: "La descripción es obligatoria" })
  errores: Record<string, string>;

  constructor(status: number, mensaje: string, errores: Record<string, string> = {}) {
    super(mensaje);
    this.status = status;
    this.errores = errores;
  }
}

export async function pedir<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  if (!API_URL) {
    throw new ErrorDeApi(0, 'No se pudo detectar el servidor. Configurá EXPO_PUBLIC_API_URL en el archivo .env.local');
  }

  // si el servidor no contesta (apagado, firewall, otra red) se corta la espera en vez de quedar cargando
  const corte = new AbortController();
  const temporizador = setTimeout(() => corte.abort(), ESPERA_MAXIMA_MS);

  let respuesta: Response;
  try {
    respuesta = await fetch(API_URL + ruta, {
      ...opciones,
      signal: corte.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
        ...opciones.headers,
      },
    });
  } catch {
    throw new ErrorDeApi(0, 'No se pudo conectar con el servidor. Revisá tu conexión.');
  } finally {
    clearTimeout(temporizador);
  }

  if (respuesta.status === 204) {
    return undefined as T;
  }
  // el backend siempre responde JSON; los errores vienen como { mensaje, errores }
  const cuerpo = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new ErrorDeApi(respuesta.status, cuerpo?.mensaje ?? 'Ocurrió un error inesperado', cuerpo?.errores ?? {});
  }
  return cuerpo as T;
}
