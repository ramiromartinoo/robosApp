package com.proyectApp.robosApp.config;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;

// Solo se activa si está configurada la ruta a la clave de servicio (robosapp.firebase.credenciales)
@Configuration
@ConditionalOnProperty(name = "robosapp.firebase.credenciales")
public class FirebaseConfig {

	@Bean
	FirebaseApp firebaseApp(@Value("${robosapp.firebase.credenciales}") String rutaCredenciales) throws IOException {
		// DevTools reinicia el contexto sin reiniciar la JVM: la app de Firebase puede existir de antes
		if (!FirebaseApp.getApps().isEmpty()) {
			return FirebaseApp.getInstance();
		}
		try (InputStream credenciales = new FileInputStream(rutaCredenciales)) {
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

}
