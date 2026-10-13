# Radar Vecinal — backend

API del proyecto de reportes de robos e incidentes de inseguridad en Mar del Plata. Guarda los reportes, los usuarios y la moderación, y le responde a la app móvil, que está en la carpeta [`robosApp-movil`](../robosApp-movil/README.md) de este mismo repositorio.

**Estado:** en desarrollo. Funciona completo en una PC con usuarios de prueba; todavía no está publicado en ningún servidor.

## Tecnologías

- Java 21 o superior, Spring Boot 4 y Maven (viene con su propio `mvnw`, no hace falta instalar Maven).
- MySQL 8.4.
- Spring Security con tokens: Firebase Authentication para el login con Google, y tokens fijos de prueba para desarrollo.

## Puesta en marcha

### 1. Base de datos

Con MySQL corriendo, crear la base vacía. Las tablas las crea la aplicación sola al arrancar.

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

**Borra todos los reportes, votos y denuncias** y carga 18 reportes inventados repartidos por la ciudad. Solo existe con los tokens de prueba activados.

## Qué ofrece la API

Todas las rutas piden el encabezado `Authorization`, salvo las marcadas como públicas.

| Ruta | Para qué |
|---|---|
| `POST /auth/google` (pública) | Inicia sesión con el token y devuelve los datos del usuario. La primera vez lo registra. |
| `GET /terminos/vigentes` (pública) | Términos y condiciones vigentes. |
| `POST /terminos/aceptar` | Acepta la versión vigente. |
| `GET /reportes` | Feed paginado. Filtros: `categoria`, y `lat` + `lng` + `radio` (en km). |
| `POST /reportes` | Publica un reporte. Máximo 5 por hora por usuario. |
| `GET /reportes/mios` | Los reportes propios. |
| `PUT /reportes/{id}` | Edita uno propio, solo durante los primeros 10 minutos. |
| `DELETE /reportes/{id}` | Elimina uno propio. |
| `GET /reportes/heatmap` | Puntos del mapa de calor. Período con `horas` o `dias`. |
| `POST` / `DELETE /reportes/{id}/confirmar` | Confirma o niega un reporte ajeno, o anula el voto. |
| `POST /reportes/{id}/denunciar` | Denuncia un reporte. |
| `POST /sugerencias`, `GET /sugerencias/mias` | Envía una sugerencia y lista las propias. |
| `/admin/**` | Moderación: usuarios, reportes, denuncias, sugerencias, estadísticas y términos. Solo rol ADMIN. |

Los errores vuelven siempre con la misma forma: `{ "mensaje": "...", "errores": { "campo": "detalle" } }`.

### Reglas que conviene conocer

- **Términos y condiciones:** mientras un cliente no acepte la versión vigente, cualquier otra ruta le responde **428**. Publicar una versión nueva obliga a todos a aceptar de nuevo.
- **Ubicación:** se guarda la exacta, pero la API solo devuelve una aproximada (unos 100 metros).
- **Denuncias:** al llegar a 5 denuncias pendientes, el reporte se oculta del feed hasta que un administrador lo revise.
- **Administradores:** el rol se asigna a mano en la base (`UPDATE usuarios SET rol = 'ADMIN' WHERE email = '...'`). No hay ninguna ruta que lo cambie.

## Login con Google (opcional)

Para validar tokens reales de Firebase hace falta la clave de servicio del proyecto de Firebase (un archivo `.json`). Se guarda fuera de `src/`, se indica su ruta en `robosapp.firebase.credenciales` dentro de `application-local.yaml`, y **no se sube al repositorio**: pedirla por un medio privado. Sin esa clave la aplicación arranca igual y solo funcionan los tokens de prueba.

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

- Las tablas se crean con `ddl-auto: update`, que sirve solo para desarrollo. Falta pasar a migraciones (Flyway).
- Los enums se guardan como texto con una restricción `CHECK`. Al agregar un valor nuevo (por ejemplo, otra categoría) hay que actualizar esa restricción a mano en la tabla.
- Hay una sola prueba automática, que verifica que la aplicación arranca. Necesita la base de datos disponible.
- Las notificaciones push no están implementadas.

## Ramas

- `main`: versión estable. No se trabaja directamente ahí.
- `develop`: donde se juntan los cambios terminados.
- `feature/...`, `fix/...`, `docs/...`: una rama por cada cambio, que sale de `develop` y vuelve a `develop`.
