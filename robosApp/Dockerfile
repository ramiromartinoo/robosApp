# Imagen del backend para correrlo en un servidor (Render, una VM, etc.). Ver DESPLIEGUE.md.
#
# Se arma en dos etapas: la primera compila con Maven y la segunda solo lleva Java y el .jar,
# así la imagen final es chica y no incluye el código fuente ni las herramientas de compilación.

# --- Etapa 1: compilar ---
FROM maven:3.9-eclipse-temurin-21 AS compilacion
WORKDIR /codigo

# Primero solo el pom: Docker guarda las dependencias descargadas y no las vuelve a bajar
# mientras el pom no cambie
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
# Las pruebas necesitan un MySQL y acá no hay: se corren antes, en la PC (.\mvnw.cmd test)
RUN mvn -B -q package -DskipTests

# --- Etapa 2: ejecutar ---
FROM eclipse-temurin:21-jre
WORKDIR /app

# Sin permisos de administrador: si alguien encontrara una falla en la app, no controla el contenedor
RUN useradd --system --no-create-home robosapp
USER robosapp

COPY --from=compilacion /codigo/target/*.jar app.jar

# En los planes gratuitos hay poca memoria (512 MB en Render). Java usa hasta el 70 % para sus
# objetos y deja el resto para lo demás; el recolector "serial" es el que menos memoria gasta.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70 -XX:+UseSerialGC -Xss512k"
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
