# Despliegue del backend

Cómo poner el backend en internet, para que la app funcione sin la PC prendida y desde cualquier red.
Todo lo de esta guía se puede hacer **sin pagar**. Los límites de los planes gratuitos se revisaron en octubre de 2026 y cambian seguido: conviene confirmarlos en la página de cada servicio antes de empezar.

## Antes de empezar: qué falta para que sirva

Con el perfil de producción los tokens de prueba (`dev-cliente`, `dev-admin`…) **no funcionan**: es a propósito, porque con ellos cualquiera podría entrar como administrador. Eso significa que, hasta que la app tenga el **login con Google**, nadie puede usar el backend desplegado.

El orden razonable es:

1. Login con Google en la app (necesita compilarla con EAS; el plan gratuito alcanza).
2. Desplegar el backend con esta guía.
3. Publicar los términos y nombrar al primer administrador (ver "Después de desplegar").
4. Apuntar la app al servidor.

Desplegar antes del paso 1 sirve para probar que el servidor arranca y responde, pero no para usar la app.

## Qué hay en el repositorio

| Archivo | Para qué |
|---|---|
| `Dockerfile` | Arma una imagen con Java 21 y el backend. La usan las dos opciones de abajo. |
| `.dockerignore` | Impide que `application-local.yaml` y la clave de Firebase terminen dentro de la imagen. |
| `docker-compose.yml` + `.env.example` | Backend y MySQL juntos en una sola máquina (opción B). |

El backend toma toda la configuración de variables de entorno:

| Variable | Valor |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` (el `Dockerfile` ya la define) |
| `DB_URL` | Dirección de la base, por ejemplo `jdbc:mysql://servidor:puerto/base?sslMode=REQUIRED` |
| `DB_USERNAME`, `DB_PASSWORD` | Usuario y contraseña de la base |
| `ROBOSAPP_FIREBASE_CREDENCIALES_JSON` | El **contenido** completo del `.json` de la clave de servicio de Firebase |
| `PORT` | Puerto donde escucha. Los hostings lo definen solos; si no está, usa el 8080 |

Si falta Firebase o quedaron activados los tokens de prueba, el backend **se niega a arrancar** y lo dice en el registro (ver `ChequeoDeProduccion`).

## Opción A (recomendada para la beta): Render + Aiven

- **Render** corre el backend. Plan gratuito: 512 MB de memoria y 750 horas por mes (alcanza para tenerlo prendido todo el mes). **Se duerme después de 15 minutos sin uso** y tarda alrededor de un minuto en despertar.
- **Aiven** da la base MySQL 8. Plan gratuito: 1 GB de disco, sin vencimiento. Si la base queda mucho tiempo sin uso la pueden apagar, avisando antes por correo; se vuelve a prender desde su panel.

Ninguno de los dos pide tarjeta para el plan gratuito.

### 1. La base en Aiven

1. Crear una cuenta en [aiven.io](https://aiven.io) y un servicio **MySQL** con el plan **Free**.
2. Cuando esté en "Running", copiar de la pestaña *Overview*: **Host**, **Port**, **User** (`avnadmin`), **Password** y **Database name** (`defaultdb`).
3. Armar la dirección para el backend:
   ```
   jdbc:mysql://HOST:PORT/defaultdb?sslMode=REQUIRED
   ```
   Aiven exige conexión cifrada: por eso va `sslMode=REQUIRED`.

No hace falta crear tablas: Flyway las crea solas la primera vez que arranca el backend.

### 2. El backend en Render

1. Crear una cuenta en [render.com](https://render.com) entrando con GitHub, y darle acceso al repositorio `robosApp` (puede ser privado).
2. *New* → *Web Service* → elegir el repositorio.
3. Completar:
   - **Branch**: `main`
   - **Root Directory**: `robosApp` (ahí está el `Dockerfile`)
   - **Language / Runtime**: Docker
   - **Instance Type**: Free
4. En *Environment Variables* cargar `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` y `ROBOSAPP_FIREBASE_CREDENCIALES_JSON` (pegar el `.json` completo, tal cual).
5. En *Advanced* → **Health Check Path**: `/actuator/health`.
6. *Create Web Service*. La primera compilación tarda varios minutos. Cuando termine, Render muestra la dirección, del estilo `https://robosapp.onrender.com`.

Cada vez que se sube algo a `main`, Render vuelve a compilar y publica la versión nueva solo.

### 3. Comprobar que anda

Abrir en el navegador `https://LA-DIRECCION/actuator/health`. Tiene que mostrar `"status":"UP"`. Si tarda, es que estaba dormido: esperar un minuto.

### Que no se duerma (opcional)

Un servicio gratuito como [UptimeRobot](https://uptimerobot.com) puede consultar `/actuator/health` cada 10 minutos, y así Render nunca llega a dormirlo. Si se duerme igual, la app muestra el error de conexión con el botón "Reintentar" (espera 10 segundos por pedido) y anda al segundo o tercer intento.

## Opción B: un servidor propio con Docker

Para cuando la app tenga más uso y moleste que se duerma. Se alquila (o se consigue gratis) una máquina virtual con Linux, y en ella corren el backend y MySQL juntos con `docker-compose.yml`.

- **Gratis**: Oracle Cloud tiene un plan *Always Free* con máquinas ARM. Pide tarjeta para verificar la identidad, no cobra, pero en algunas regiones no hay lugar y hay que reintentar. En 2026 hubo reportes de que achicaron la máquina gratuita para cuentas nuevas: revisar el límite vigente.
- **Pago**: cualquier VPS de 1 a 2 GB de memoria, por unos pocos dólares al mes.

En la máquina (con Docker instalado):

```bash
git clone https://github.com/ramiromartinoo/robosApp.git
cd robosApp/robosApp
cp .env.example .env     # completar las contraseñas y la clave de Firebase
docker compose up -d --build
```

El backend queda en el puerto 8080. Para tener `https` (las tiendas lo exigen) hace falta un dominio y un proxy como Caddy delante; eso queda para cuando se elija esta opción.

## Después de desplegar

### Publicar los términos

En producción no se carga el borrador de los términos: hasta que haya una versión publicada, nadie puede aceptarla. Se publica como administrador con `POST /admin/terminos` (el cuerpo lo define `PublicarTerminosRequest`). **Pendiente**: hoy no hay una pantalla para esto en el panel; conviene agregarla antes de abrir la beta, junto con los términos revisados.

### Nombrar al primer administrador

Las cuentas nuevas son siempre `CLIENTE`. Después de entrar una vez a la app con Google, conectarse a la base (MySQL Workbench sirve para Aiven: tildar SSL en la conexión) y correr:

```sql
update usuarios set rol = 'ADMIN' where email = 'tu-correo@gmail.com';
```

A los siguientes administradores se los puede nombrar igual.

### Apuntar la app al servidor

En `robosApp-movil/.env.local`:

```
EXPO_PUBLIC_API_URL=https://LA-DIRECCION
```

Para la app compilada con EAS, la misma variable se configura en el perfil de compilación.

## Probar la imagen en la PC (opcional)

Hace falta Docker Desktop. Desde `robosApp/`:

```bash
docker build -t robosapp .
```

Si compila, la imagen es la misma que va a armar Render.
