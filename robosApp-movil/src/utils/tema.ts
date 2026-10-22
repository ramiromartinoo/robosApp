import * as SecureStore from 'expo-secure-store';
import { Appearance } from 'react-native';

// Paleta de la app. Todos los colores salen de acá: para cambiar el estilo se toca solo este archivo.
//
// El modo (claro u oscuro) se decide una sola vez, al abrir la app: los estilos de cada pantalla
// se arman con StyleSheet.create al cargar el archivo y no se recalculan. Por eso, al elegir otro
// modo en "Mi cuenta", la app se recarga (ver SelectorDeModo).

// automático = el mismo modo que el celular
export type ModoDeColor = 'automatico' | 'claro' | 'oscuro';

const CLAVE_MODO = 'modo-de-color';

function leerModo(): ModoDeColor {
  try {
    const guardado = SecureStore.getItem(CLAVE_MODO);
    return guardado === 'claro' || guardado === 'oscuro' ? guardado : 'automatico';
  } catch {
    return 'automatico';
  }
}

// lo que eligió el usuario; se lee de forma sincrónica porque los estilos se arman al cargar
export const modoElegido: ModoDeColor = leerModo();

// Guarda la preferencia; se aplica la próxima vez que se cargue la app
export function guardarModo(modo: ModoDeColor) {
  SecureStore.setItem(CLAVE_MODO, modo);
}

// El modo elegido se le impone también a lo nativo (teclado, selector de fecha, mapa, alertas).
// En automático se borra explícitamente: al recargar, la imposición anterior sigue viva en lo nativo.
Appearance.setColorScheme(
  modoElegido === 'oscuro' ? 'dark' : modoElegido === 'claro' ? 'light' : 'unspecified',
);

export const esOscuro =
  modoElegido === 'oscuro' || (modoElegido === 'automatico' && Appearance.getColorScheme() === 'dark');

type Paleta = {
  // verde de marca como FONDO: encabezado, botón de reportar, botones principales, selección
  primario: string;
  // verde de marca como TEXTO o ÍCONO sobre una superficie (links, íconos, indicadores de carga).
  // En el modo oscuro tiene que ser más claro que "primario" para que se lea sobre el fondo oscuro.
  primarioTexto: string;
  // verde suave: avatares, etiquetas y fondos de íconos
  primarioSuave: string;
  // llamados a la acción (hoy es el mismo verde de marca)
  acento: string;

  fondo: string;
  superficie: string;
  borde: string;

  texto: string;
  textoSuave: string;
  textoSobreColor: string;
  deshabilitado: string;

  confirmar: string;
  confirmarSuave: string;
  negar: string;
  negarSuave: string;
  aviso: string;
  avisoSuave: string;

  errorTexto: string;
  errorFondo: string;
  avisoTexto: string;

  // capa semitransparente detrás de los modales
  velo: string;
  // capa más oscura, para la búsqueda de dirección que tapa el mapa
  veloFuerte: string;
};

const claro: Paleta = {
  primario: '#1b4d3e',
  primarioTexto: '#1b4d3e',
  primarioSuave: '#dcebe4',
  acento: '#1b4d3e',

  fondo: '#eaf3ef',
  superficie: '#ffffff',
  borde: '#d5e3dc',

  texto: '#12261f',
  textoSuave: '#5b6f66',
  textoSobreColor: '#ffffff',
  deshabilitado: '#b9cbc3',

  confirmar: '#1e7a46',
  confirmarSuave: '#dff3e6',
  negar: '#c0392b',
  negarSuave: '#fde2e2',
  aviso: '#9a6b00',
  avisoSuave: '#fdf0d5',

  errorTexto: '#a3271b',
  errorFondo: '#fde2e2',
  avisoTexto: '#9a6b00',

  velo: 'rgba(15, 23, 42, 0.5)',
  veloFuerte: 'rgba(15, 23, 42, 0.8)',
};

// Mismos verdes de marca, sobre fondos casi negros con un toque verde para que no se vea gris plano.
// Los colores "suaves" pasan a ser tonos oscuros, y los de texto, tonos claros.
const oscuro: Paleta = {
  primario: '#23634f',
  primarioTexto: '#7fd1b0',
  primarioSuave: '#1d3a31',
  acento: '#23634f',

  fondo: '#0e1714',
  superficie: '#17231f',
  borde: '#2a3a34',

  texto: '#e6efeb',
  textoSuave: '#9db1a8',
  textoSobreColor: '#ffffff',
  deshabilitado: '#3c4f48',

  confirmar: '#5fcf8e',
  confirmarSuave: '#173a27',
  negar: '#f08a7e',
  negarSuave: '#3d1f1c',
  aviso: '#e8b94a',
  avisoSuave: '#3a2f14',

  errorTexto: '#f08a7e',
  errorFondo: '#3d1f1c',
  avisoTexto: '#e8b94a',

  velo: 'rgba(0, 0, 0, 0.6)',
  veloFuerte: 'rgba(0, 0, 0, 0.85)',
};

export const colores: Paleta = esOscuro ? oscuro : claro;

// Sombra suave para tarjetas y elementos flotantes (en el modo oscuro casi no se nota; ahí separan los bordes)
export const sombra = {
  shadowColor: esOscuro ? '#000000' : '#12261f',
  shadowOpacity: esOscuro ? 0.3 : 0.08,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};
