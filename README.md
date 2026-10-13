# Alerta Vecinal — app móvil

App para Android y iPhone donde los vecinos de Mar del Plata reportan robos e incidentes de inseguridad y ven lo que pasa cerca. Necesita el backend, que vive en otro repositorio: [robosapp-backend](https://github.com/ramiromartinoo/robosapp-backend).

**Estado:** en desarrollo. Se prueba en el celular con Expo Go y entra con usuarios de prueba; el login con Google todavía no está.

## Tecnologías

- React Native con TypeScript, sobre Expo (SDK 57).
- Expo Router para la navegación.
- `react-native-maps` para los mapas y `expo-location` para la ubicación.

## Puesta en marcha

### Requisitos

- [Node.js](https://nodejs.org) (versión LTS) en la PC.
- La app **Expo Go** en el celular.
- El backend corriendo en la misma PC (ver su README).
- El celular y la PC en el mismo wifi.

### Instalar

```powershell
npm.cmd install
```

Copiar `.env.example` como `.env.local`. Con los valores que trae alcanza para empezar.

### Arrancar

```powershell
npx.cmd expo start
```

Aparece un código QR: se escanea con la cámara (iPhone) o desde Expo Go (Android).

> En PowerShell hay que escribir `npx.cmd` y `npm.cmd`. Sin el `.cmd`, Windows los bloquea por su política de scripts.

## Si no conecta

- **La app abre pero Inicio muestra "No se pudo conectar con el servidor":** casi siempre es el firewall de Windows. Si el wifi figura como red *pública*, Windows bloquea a Java. Hay que pasarlo a red *privada*: Configuración → Red e Internet → Wi-Fi → propiedades de la red.
- **El QR no carga la app:** revisar que el celular y la PC estén en el mismo wifi. Si igual no anda, usar `npx.cmd expo start --tunnel` y definir `EXPO_PUBLIC_API_URL` en `.env.local` (ver abajo).
- **Se ve una versión vieja:** `npx.cmd expo start --clear`.

## Configuración (`.env.local`)

Este archivo no se sube al repositorio.

| Variable | Para qué |
|---|---|
| `EXPO_PUBLIC_DEV_TOKEN` | Con qué usuario de prueba entra la app: `dev-cliente`, `dev-cliente-2`, `dev-cliente-3` o `dev-admin`. |
| `EXPO_PUBLIC_API_URL` | Dirección del backend. **Normalmente no hace falta**: la app usa sola la IP de la PC que corre Expo. Solo se define con `--tunnel` o si el backend está en otro equipo. |

Después de cambiar este archivo hay que reiniciar Expo.

Para ver el **panel de administrador**, usar `EXPO_PUBLIC_DEV_TOKEN=dev-admin`.

## Qué tiene la app

- **Bienvenida:** pide aceptar los términos y condiciones la primera vez y cada vez que cambian.
- **Inicio:** feed de reportes con filtros por tipo de hecho y por distancia. Cada reporte muestra a cuántos metros ocurrió y permite confirmarlo, negarlo, denunciarlo o ver la zona en el mapa.
- **Reportar:** formulario con tipo de hecho, descripción, fecha y ubicación (GPS y un pin que se ajusta moviendo el mapa).
- **Mapa:** mapa de calor de las últimas 3 horas, 1 día o 7 días.
- **Mi cuenta:** mis reportes (editar y eliminar), sugerencias y, para administradores, el panel de moderación.

## Organización del código

Dentro de `src/`:

| Carpeta | Contenido |
|---|---|
| `app` | Las rutas. Cada archivo es una pantalla (Expo Router); `(tabs)` son las pestañas de abajo. Los archivos son cortos: solo apuntan a `screens`. |
| `screens` | Las pantallas. |
| `components` | Piezas que usan varias pantallas. |
| `api` | Los pedidos al backend. `cliente.ts` es el único lugar que conoce la dirección y el token. |
| `sesion` | Quién es el usuario y si aceptó los términos. |
| `utils` | Colores (`tema.ts`), categorías, fechas y distancias. |

Para cambiar los colores de toda la app se toca solo `src/utils/tema.ts`.

## Comprobaciones antes de subir cambios

```powershell
npx.cmd tsc --noEmit
```

Verifica los tipos. No hay pruebas automáticas todavía.

## Pendientes conocidos

- **Login con Google:** requiere una versión compilada de la app (no funciona en Expo Go) y, en iPhone, una cuenta de Apple Developer. Mientras tanto se entra con los tokens de prueba.
- **Notificaciones push:** dependen de lo mismo.
- **Mapas fuera de Expo Go:** al compilar la app para Android va a hacer falta una clave de Google Maps.
- Las listas de Mi cuenta y del panel traen hasta 50 elementos, sin paginado.
- El nombre y el ícono de la app son todavía los genéricos.

## Ramas

- `main`: versión estable. No se trabaja directamente ahí.
- `develop`: donde se juntan los cambios terminados.
- `feature/...`, `fix/...`, `docs/...`: una rama por cada cambio, que sale de `develop` y vuelve a `develop`.
