// Firebase incluye getReactNativePersistence solo en su versión para React Native, que es la que usa
// la app al correr (Metro la elige). Pero TypeScript lee siempre los tipos de la versión web, donde no
// existe. Esta declaración agrega solo esa función a los tipos de 'firebase/auth'.
import type { Persistence } from 'firebase/auth';

declare module 'firebase/auth' {
  interface AlmacenamientoDeReactNative {
    getItem(clave: string): Promise<string | null>;
    setItem(clave: string, valor: string): Promise<void>;
    removeItem(clave: string): Promise<void>;
  }

  export function getReactNativePersistence(almacenamiento: AlmacenamientoDeReactNative): Persistence;
}
