# Radar Vecinal

App para que los vecinos de Mar del Plata reporten robos e incidentes de inseguridad y vean lo que pasa cerca: un feed de reportes, un mapa de calor y moderación por parte de administradores.

**Estado:** en desarrollo. Funciona completo en una PC con usuarios de prueba y se prueba en el celular con Expo Go. Todavía no está publicado.

## Qué hay en este repositorio

Son dos programas independientes, cada uno en su carpeta y con su propio README:

| Carpeta | Qué es | Tecnologías |
|---|---|---|
| [`robosApp/`](robosApp/README.md) | El **backend**: la API que guarda los reportes, los usuarios y la moderación. | Java, Spring Boot, MySQL |
| [`robosApp-movil/`](robosApp-movil/README.md) | La **app móvil** para Android y iPhone. | React Native, TypeScript, Expo |

La app le pide los datos al backend por la red; no comparten código.

## Para empezar

1. **Backend:** seguir [`robosApp/README.md`](robosApp/README.md). Hace falta Java 21 o superior y MySQL.
2. **App:** seguir [`robosApp-movil/README.md`](robosApp-movil/README.md). Hace falta Node.js y la app Expo Go en el celular.

Cada proyecto se abre por separado: en IntelliJ hay que abrir la carpeta `robosApp` (la que tiene el `pom.xml`), no la raíz del repositorio.

## Archivos que no se suben

Las contraseñas y claves quedan fuera del repositorio. Cada persona arma los suyos a partir de las plantillas:

- `robosApp/src/main/resources/application-local.yaml` (desde `application-local.yaml.example`): contraseña de MySQL.
- `robosApp-movil/.env.local` (desde `.env.example`): con qué usuario de prueba entra la app.
- La clave de servicio de Firebase (un `.json`), si se usa: se pasa por un medio privado.

## Ramas

- `main`: versión estable. No se trabaja directamente ahí.
- `develop`: donde se juntan los cambios terminados.
- `feature/...`, `fix/...`, `docs/...`: una rama por cada cambio, que sale de `develop` y vuelve a `develop`.
