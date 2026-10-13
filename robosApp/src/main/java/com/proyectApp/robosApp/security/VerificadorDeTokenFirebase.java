package com.proyectApp.robosApp.security;

import java.util.Optional;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;

import lombok.RequiredArgsConstructor;

// Valida el ID token que Firebase le entrega a la app después del login con Google
@Component
@ConditionalOnProperty(name = "robosapp.firebase.credenciales")
@RequiredArgsConstructor
public class VerificadorDeTokenFirebase implements VerificadorDeToken {

	private final FirebaseAuth firebaseAuth;

	@Override
	public Optional<TokenVerificado> verificar(String token) {
		try {
			// comprueba firma, vencimiento y que el token sea de nuestro proyecto
			FirebaseToken verificado = firebaseAuth.verifyIdToken(token);
			return Optional.of(new TokenVerificado(verificado.getUid(), verificado.getEmail(), verificado.getName()));
		} catch (FirebaseAuthException | IllegalArgumentException e) {
			return Optional.empty();
		}
	}

}
