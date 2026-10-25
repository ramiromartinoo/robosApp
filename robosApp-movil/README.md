# Radar Vecinal — app móvil

App para Android y iPhone donde los vecinos de Mar del Plata reportan robos e incidentes de inseguridad y ven lo que pasa cerca. Necesita el backend, que está en la carpeta [`robosApp`](../robosApp/README.md) de este mismo repositorio.

**Estado:** en desarrollo. Se prueba en el celular con Expo Go. Se entra con mail y contraseña (Firebase) o, en desarrollo, con usuarios de prueba; el login con Google y Apple todavía no está.

## Tecnologías

- React Native con TypeScript, sobre Expo (SDK 57).
- Expo Router para la navegación.
- `react-native-maps` para los mapas y `expo-location` para la ubicación.

## Puesta en marcha

### Requisitos

- [Node.js](https://nodejs.org) (versión LTS) en la PC.
- La app **Expo Go** en el celular.
- El backend corriendo en la misma PC (ver [su README](../robosApp/README.md)).
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
| `EXPO_PUBLIC_DEV_TOKEN` | Solo sin Firebase configurado: con qué usuario de prueba entra la app (`dev-cliente`, `dev-cliente-2`, `dev-cliente-3` o `dev-admin`). |
| `EXPO_PUBLIC_FIREBASE_*` | La configuración de la app web del proyecto de Firebase, para el login con mail y contraseña (ver `.env.example`). No son secretos. Sin ellas se entra solo con los usuarios de prueba. |
| `EXPO_PUBLIC_API_URL` | Dirección del backend. **Normalmente no hace falta**: la app usa sola la IP de la PC que corre Expo. Solo se define con `--tunnel` o si el backend está en otro equipo. |

Después de cambiar este archivo hay que reiniciar Expo.

**Usuarios de prueba:** en la pantalla para entrar y en **Mi cuenta → Usuario de prueba** se elige uno con un toque, sin loguearse ni editar este archivo, y la app recuerda la elección hasta que se cierra la sesión. Para que el backend acepte el login con mail y contraseña, tiene que tener configurada la clave de Firebase del mismo proyecto (ver su README). Para ver el **panel de administrador**, elegir "Admin de prueba". Esa sección solo existe en desarrollo: en la app publicada no aparece.

## Qué tiene la app

- **Entrar:** con mail y contraseña, crear una cuenta o recuperar la contraseña (Firebase manda el mail).
- **Bienvenida:** pide aceptar los términos y condiciones la primera vez y cada vez que cambian.
- **Inicio:** feed de reportes con filtros por tipo de hecho y por distancia. Cada reporte muestra a cuántos metros ocurrió y permite confirmarlo, negarlo, denunciarlo o ver la zona en el mapa.
- **Reportar:** formulario con tipo de hecho, descripción, fecha y ubicación (GPS y un pin que se ajusta moviendo el mapa).
- **Mapa:** mapa de calor de las últimas 3 horas, 1 día o 7 días.
- **Mi cuenta:** mis reportes (editar y eliminar), sugerencias, el modo claro u oscuro, cerrar sesión y, para administradores, el panel de moderación.

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

- **Login con Google y con Apple:** requieren una versión compilada de la app (no funcionan en Expo Go) y, para Apple, una cuenta de Apple Developer. Mientras tanto se entra con mail y contraseña.
- **Eliminar la propia cuenta** desde la app: Apple y Google lo exigen para publicar una app con registro.
- **Notificaciones push:** dependen de lo mismo.
- **Mapas fuera de Expo Go:** al compilar la app para Android va a hacer falta una clave de Google Maps.
- El ícono y la pantalla de carga propios se ven completos recién en una versión compilada: Expo Go muestra su propia pantalla de carga.

## Ícono y pantalla de carga

Las imágenes de `assets/` se generan con un script, sin instalar nada:

```powershell
node scripts/generar-iconos.js
```

Para cambiar el color o la forma se edita ese archivo y se vuelve a correr. La configuración que las usa está en `app.json`.

## Ramas

- `main`: versión estable. No se trabaja directamente ahí.
- `develop`: donde se juntan los cambios terminados.
- `feature/...`, `fix/...`, `docs/...`: una rama por cada cambio, que sale de `develop` y vuelve a `develop`.
