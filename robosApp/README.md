# Radar Vecinal — backend

API del proyecto de reportes de robos e incidentes de inseguridad en Mar del Plata. Guarda los reportes, los usuarios y la moderación, y le responde a la app móvil, que está en la carpeta [`robosApp-movil`](../robosApp-movil/README.md) de este mismo repositorio.

**Estado:** en desarrollo. Funciona completo en una PC con usuarios de prueba; todavía no está publicado en ningún servidor.

## Tecnologías

- Java 21 o superior, Spring Boot 4 y Maven (viene con su propio `mvnw`, no hace falta instalar Maven).
- MySQL 8.4.
- Spring Security con tokens: Firebase Authentication para el login con Google, y tokens fijos de prueba para desarrollo.

## Puesta en marcha

### 1. Base de datos

Con MySQL corriendo, crear la base vacía. Las tablas las crea la aplicación sola al arrancar, con las migraciones de Flyway.

```sql
CREATE DATABASE robosapp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configuración local

Copiar `src/main/resources/application-local.yaml.example` como `application-local.yaml`, en esa misma carpeta, y completar:

- `DB_PASSWORD`: la contraseña del usuario `root` de MySQL.
- `DB_URL`: solo si MySQL no está en el puerto 3307. El proyecto usa el 3307 por defecto; el puerto habitual de MySQL es el 3306.

`application-local.yaml` está en `.gitignore`. **Nunca se sube**: ahí van las contraseñas.

### 3. Arrancar

Desde IntelliJ: abrir la carpeta del proyecto y ejecutar `RobosAppApplication`.

Desde una terminal (PowerShell), con `JAVA_HOME` apuntando al JDK:

```powershell
$env:JAVA_HOME = "C:\ruta\al\jdk"
.\mvnw.cmd spring-boot:run
```

Está listo cuando aparece `Started RobosAppApplication`. Queda escuchando en `http://localhost:8080`.

### 4. Probar que anda

```powershell
Invoke-RestMethod -Uri http://localhost:8080/reportes -Headers @{ Authorization = "Bearer dev-cliente" }
```

La primera vez responde con un error 428: hay que aceptar los términos y condiciones (ver más abajo). Es lo esperado.

## Usuarios de prueba

Con `robosapp.seguridad.tokens-de-prueba: true` en `application-local.yaml`, al arrancar se crean cuatro usuarios y se puede entrar mandando su token en el encabezado `Authorization: Bearer <token>`:

| Token | Usuario | Rol |
|---|---|---|
| `dev-cliente` | Vecino de prueba | CLIENTE |
| `dev-cliente-2` | Vecina de prueba | CLIENTE |
| `dev-cliente-3` | Vecino de prueba 3 | CLIENTE |
| `dev-admin` | Admin de prueba | ADMIN |

> **Importante:** estos tokens son una puerta abierta. Solo existen si ese interruptor está en `true`, y su valor por defecto es `false`. En un servidor real tiene que quedar apagado.

### Datos de ejemplo

Para tener reportes creíbles con qué mostrar la app:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8080/admin/dev/datos-de-ejemplo -Headers @{ Authorization = "Bearer dev-admin" }
```

**Borra todos los reportes y denuncias** y carga 18 reportes inventados repartidos por la ciudad. Solo existe con los tokens de prueba activados.

## Qué ofrece la API

Todas las rutas piden el encabezado `Authorization`, salvo las marcadas como públicas.

| Ruta | Para qué |
|---|---|
| `POST /auth/google` (pública) | Inicia sesión con el token y devuelve los datos del usuario. La primera vez lo registra. |
| `GET /terminos/vigentes` (pública) | Términos y condiciones vigentes. |
| `POST /terminos/aceptar` | Acepta la versión vigente. |
| `GET /reportes` | Feed paginado. Filtros: `categoria`, y `lat` + `lng` + `radio` (en km). Orden con `orden`: `HECHO` (por defecto, la hora del hecho) o `PUBLICACION`. |
| `POST /reportes` | Publica un reporte. Máximo 5 por hora por usuario. |
| `GET /reportes/mios` | Los reportes propios. |
| `PUT /reportes/{id}` | Edita uno propio, solo durante los primeros 10 minutos. |
| `DELETE /reportes/{id}` | Elimina uno propio. |
| `GET /reportes/heatmap` | Puntos del mapa de calor. Período con `horas` o `dias`. |
| `POST /reportes/{id}/denunciar` | Denuncia un reporte. |
| `POST /sugerencias`, `GET /sugerencias/mias` | Envía una sugerencia y lista las propias. |
| `/admin/**` | Moderación: usuarios, reportes, denuncias, sugerencias, estadísticas y términos. Solo rol ADMIN. |

Los errores vuelven siempre con la misma forma: `{ "mensaje": "...", "errores": { "campo": "detalle" } }`.

### Reglas que conviene conocer

- **Términos y condiciones:** mientras un cliente no acepte la versión vigente, cualquier otra ruta le responde **428**. Publicar una versión nueva obliga a todos a aceptar de nuevo.
- **Ubicación:** se guarda la exacta, pero la API solo devuelve una aproximada (unos 100 metros).
- **Denuncias:** al llegar a 5 denuncias pendientes, el reporte se oculta del feed hasta que un administrador lo revise.
- **Administradores:** el rol se asigna a mano en la base (`UPDATE usuarios SET rol = 'ADMIN' WHERE email = '...'`). No hay ninguna ruta que lo cambie.
- **Antiabuso:** al publicar se guardan la IP, un identificador de la instalación de la app (encabezado `X-Dispositivo`) y la distancia entre el teléfono y el lugar. Nunca se devuelven en el feed. El panel los usa para mostrar la distancia de cada reporte y las cuentas que publicaron desde el mismo teléfono o la misma conexión (`GET /admin/usuarios/{id}/relacionadas`).
- **Antecedentes:** no hay votos ni niveles de confianza. Un reporte que no corresponde se denuncia y lo resuelve la moderación. En el panel, el administrador ve de cada usuario cuántos reportes tiene publicados, cuántos le eliminó la moderación y cuántas advertencias recibió (`AntecedentesService`), para decidir si suspender, banear o eliminar la cuenta. El feed no muestra nada de esto.

## Base de datos y migraciones

Las tablas no las crea Hibernate: las crea y modifica **Flyway**, con los archivos SQL de `src/main/resources/db/migration`. Al arrancar, la aplicación aplica las migraciones que falten y Hibernate verifica que las tablas coincidan con las entidades; si no coinciden, no arranca.

Para cambiar la base (agregar una columna, una tabla, un índice):

1. Crear un archivo nuevo con el número siguiente: `V2__descripcion_corta.sql`, `V3__...`, etc.
2. Escribir ahí el SQL del cambio y ajustar la entidad de Java correspondiente.
3. Arrancar la aplicación: Flyway lo aplica solo.

**Una migración que ya se ejecutó no se edita nunca**, ni siquiera para corregir un error: el arreglo va en un archivo nuevo. Si se edita, la aplicación deja de arrancar en todas las bases donde ya corrió.

Una base que ya existía de antes de Flyway se adopta sola como versión 1 la primera vez, sin tocar sus datos.

## Producción

En un servidor se arranca con el perfil `prod` y la configuración por variables de entorno:

| Variable | Para qué |
|---|---|
| `SPRING_PROFILES_ACTIVE=prod` | Activa la configuración de producción (`application-prod.yaml`). |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | La base de datos. |
| `ROBOSAPP_FIREBASE_CREDENCIALES` | Ruta a la clave de servicio de Firebase. |

Con ese perfil los tokens de prueba quedan apagados, la IP real del usuario se toma del proxy del hosting, y la aplicación **se niega a arrancar** si detecta los tokens de prueba activados o le falta Firebase.

## Login con Google (opcional)

Para validar tokens reales de Firebase hace falta la clave de servicio del proyecto de Firebase (un archivo `.json`). Se guarda fuera de `src/`, se indica su ruta en `robosapp.firebase.credenciales` dentro de `application-local.yaml`, y **no se sube al repositorio**: pedirla por un medio privado. Sin esa clave la aplicación arranca igual y solo funcionan los tokens de prueba.

## Pruebas automáticas

Prueban de punta a punta las reglas importantes, haciéndole pedidos al backend como lo haría la app: el límite de publicaciones por hora, el auto-ocultamiento por denuncias, las resoluciones del administrador, los antecedentes que ve el panel, los permisos, los términos pendientes, las cuentas bloqueadas y que el feed no exponga datos internos.

```powershell
.\mvnw.cmd test
```

Necesitan MySQL corriendo, pero **no tocan la base de desarrollo**: usan una aparte, `robosapp_test`, que se crea sola la primera vez y se limpia antes de cada prueba. Si MySQL no está en el puerto 3307, hay que definir `DB_URL_TEST` en `application-local.yaml` (ver `src/test/resources/application-test.yaml`).

Conviene correrlas antes de subir un cambio al backend: si alguna falla, algo se rompió.

## Organización del código

Dentro de `src/main/java/com/proyectApp/robosApp/`:

| Paquete | Contenido |
|---|---|
| `controller` | Las rutas de la API y el manejo de errores. |
| `service` | La lógica de cada función. |
| `repository` | El acceso a la base de datos. |
| `entity` | Las tablas. |
| `dto` | Lo que entra y sale por la API. Las entidades nunca se exponen directamente. |
| `security` | Autenticación por token y permisos. |
| `config` | Firebase, términos y datos de prueba. |

## Pendientes conocidos

- Las bases creadas antes de Flyway tenían unas restricciones `CHECK` sobre los enums que rechazaban cualquier valor nuevo. La migración V3 las quita (en las bases nuevas no hace nada), así que agregar un valor a un enum ya no necesita migración.
- Las notificaciones push no están implementadas.

## Ramas

- `main`: versión estable. No se trabaja directamente ahí.
- `develop`: donde se juntan los cambios terminados.
- `feature/...`, `fix/...`, `docs/...`: una rama por cada cambio, que sale de `develop` y vuelve a `develop`.
