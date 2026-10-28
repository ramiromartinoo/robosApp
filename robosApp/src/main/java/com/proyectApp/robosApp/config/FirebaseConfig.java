package com.proyectApp.robosApp.config;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;

// Solo se activa si está configurada la clave de servicio, como ruta o como contenido (ver HayCredencialesDeFirebase)
@Configuration
@Conditional(HayCredencialesDeFirebase.class)
public class FirebaseConfig {

	@Bean
	FirebaseApp firebaseApp(Environment entorno) throws IOException {
		// DevTools reinicia el contexto sin reiniciar la JVM: la app de Firebase puede existir de antes
		if (!FirebaseApp.getApps().isEmpty()) {
			return FirebaseApp.getInstance();
		}
		try (InputStream credenciales = abrirCredenciales(entorno)) {
			FirebaseOptions opciones = FirebaseOptions.builder()
					.setCredentials(GoogleCredentials.fromStream(credenciales))
					.build();
			return FirebaseApp.initializeApp(opciones);
		}
	}

	@Bean
	FirebaseAuth firebaseAuth(FirebaseApp firebaseApp) {
		return FirebaseAuth.getInstance(firebaseApp);
	}

	// Si están las dos formas, gana el contenido: es la que se usa en el hosting
	private InputStream abrirCredenciales(Environment entorno) throws IOException {
		String contenido = entorno.getProperty(HayCredencialesDeFirebase.CONTENIDO);
		if (StringUtils.hasText(contenido)) {
			return new ByteArrayInputStream(contenido.getBytes(StandardCharsets.UTF_8));
		}
		return new FileInputStream(entorno.getRequiredProperty(HayCredencialesDeFirebase.RUTA));
	}

}
