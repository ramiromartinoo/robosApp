// Genera el ícono y la pantalla de carga de la app: un radar blanco sobre el verde de marca.
// Uso: node scripts/generar-iconos.js
// No necesita instalar nada: dibuja pixel por pixel y arma los PNG con lo que trae Node.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const VERDE = [0x1b, 0x4d, 0x3e];
const BLANCO = [0xff, 0xff, 0xff];
// cada pixel se calcula con 4x4 muestras, para que los bordes queden suaves
const MUESTRAS = 4;

// --- El radar, en coordenadas de -1 a 1 (x hacia la derecha, y hacia abajo) ---

const ANILLOS = [0.26, 0.52, 0.78];
const MEDIO_GROSOR = 0.028;
const RADIO = ANILLOS[ANILLOS.length - 1];
// los ángulos se miden en grados desde arriba, en sentido horario
const ANGULO_DE_LA_AGUJA = 62;
// la estela es la zona recién barrida: fuerte junto a la aguja, se apaga hacia atrás
const ANCHO_DE_LA_ESTELA = 85;
const OPACIDAD_DE_LA_ESTELA = 0.5;
const RADIO_DE_LOS_PUNTOS = 0.078;
// lo que el radar "detectó": un punto dentro de la estela
const DETECCION = { angulo: 22, distancia: 0.63 };

const aRadianes = (grados) => (grados * Math.PI) / 180;
const enPolares = (angulo, distancia) => [
  distancia * Math.sin(aRadianes(angulo)),
  -distancia * Math.cos(aRadianes(angulo)),
];

function distanciaAlSegmento(px, py, [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// Cuánto blanco hay en ese punto: 0 = nada, 1 = blanco pleno
function blancoEn(x, y) {
  const r = Math.hypot(x, y);

  // centro, punto detectado, anillos y aguja: blanco pleno
  if (r <= RADIO_DE_LOS_PUNTOS) return 1;
  const [dx, dy] = enPolares(DETECCION.angulo, DETECCION.distancia);
  if (Math.hypot(x - dx, y - dy) <= RADIO_DE_LOS_PUNTOS) return 1;
  if (ANILLOS.some((anillo) => Math.abs(r - anillo) <= MEDIO_GROSOR)) return 1;
  if (distanciaAlSegmento(x, y, [0, 0], enPolares(ANGULO_DE_LA_AGUJA, RADIO)) <= MEDIO_GROSOR) return 1;

  // estela: sector semitransparente detrás de la aguja
  if (r <= RADIO) {
    const angulo = (Math.atan2(x, -y) * 180) / Math.PI;
    const desdeElInicio = angulo - (ANGULO_DE_LA_AGUJA - ANCHO_DE_LA_ESTELA);
    if (desdeElInicio >= 0 && desdeElInicio <= ANCHO_DE_LA_ESTELA) {
      return OPACIDAD_DE_LA_ESTELA * (desdeElInicio / ANCHO_DE_LA_ESTELA);
    }
  }
  return 0;
}

// --- Dibujo ---

// fondo: color RGB, o null para transparente
// escala: cuánto del lienzo ocupa el dibujo (1 = todo; 0 = solo el fondo)
function dibujar(lado, { fondo, escala }) {
  const pixeles = Buffer.alloc(lado * lado * 4);
  const total = MUESTRAS * MUESTRAS;
  for (let py = 0; py < lado; py++) {
    for (let px = 0; px < lado; px++) {
      let blanco = 0;
      if (escala > 0) {
        for (let sy = 0; sy < MUESTRAS; sy++) {
          for (let sx = 0; sx < MUESTRAS; sx++) {
            const x = (((px + (sx + 0.5) / MUESTRAS) / lado) * 2 - 1) / escala;
            const y = (((py + (sy + 0.5) / MUESTRAS) / lado) * 2 - 1) / escala;
            blanco += blancoEn(x, y);
          }
        }
        blanco /= total;
      }
      const i = (py * lado + px) * 4;
      if (fondo) {
        // blanco mezclado sobre el color de fondo, sin transparencia
        for (let canal = 0; canal < 3; canal++) {
          pixeles[i + canal] = Math.round(fondo[canal] + (BLANCO[canal] - fondo[canal]) * blanco);
        }
        pixeles[i + 3] = 255;
      } else {
        // blanco con la transparencia que corresponda
        pixeles[i] = pixeles[i + 1] = pixeles[i + 2] = 255;
        pixeles[i + 3] = Math.round(blanco * 255);
      }
    }
  }
  return pixeles;
}

// --- PNG ---

const TABLA_CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc(datos) {
  let c = 0xffffffff;
  for (const byte of datos) c = TABLA_CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function bloque(tipo, datos) {
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const suma = Buffer.alloc(4);
  suma.writeUInt32BE(crc(cuerpo));
  return Buffer.concat([largo, cuerpo, suma]);
}

function aPng(lado, pixeles) {
  const cabecera = Buffer.alloc(13);
  cabecera.writeUInt32BE(lado, 0);
  cabecera.writeUInt32BE(lado, 4);
  cabecera.set([8, 6, 0, 0, 0], 8); // 8 bits por canal, RGBA
  // cada fila lleva adelante un byte de filtro (0 = sin filtro)
  const filas = Buffer.alloc((lado * 4 + 1) * lado);
  for (let y = 0; y < lado; y++) {
    pixeles.copy(filas, y * (lado * 4 + 1) + 1, y * lado * 4, (y + 1) * lado * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloque('IHDR', cabecera),
    bloque('IDAT', zlib.deflateSync(filas, { level: 9 })),
    bloque('IEND', Buffer.alloc(0)),
  ]);
}

// --- Archivos ---

const ARCHIVOS = [
  // ícono general (iPhone y tiendas): cuadrado sin transparencia; el sistema le redondea las esquinas
  { nombre: 'icon.png', lado: 1024, fondo: VERDE, escala: 0.92 },
  // Android arma el ícono con dos capas y recorta los bordes: el dibujo va más chico, en la zona segura
  { nombre: 'android-icon-foreground.png', lado: 512, fondo: null, escala: 0.58 },
  { nombre: 'android-icon-background.png', lado: 512, fondo: VERDE, escala: 0 },
  // versión de un solo color para los íconos temáticos de Android
  { nombre: 'android-icon-monochrome.png', lado: 432, fondo: null, escala: 0.58 },
  // pantalla de carga: solo el radar; el fondo verde lo pone la configuración
  { nombre: 'splash-icon.png', lado: 1024, fondo: null, escala: 1 },
  { nombre: 'favicon.png', lado: 48, fondo: VERDE, escala: 0.95 },
];

const carpeta = path.join(__dirname, '..', 'assets');
for (const archivo of ARCHIVOS) {
  fs.writeFileSync(path.join(carpeta, archivo.nombre), aPng(archivo.lado, dibujar(archivo.lado, archivo)));
  console.log(`${archivo.nombre} (${archivo.lado}x${archivo.lado})`);
}
