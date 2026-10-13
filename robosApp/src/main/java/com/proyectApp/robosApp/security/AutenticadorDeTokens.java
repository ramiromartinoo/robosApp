package com.proyectApp.robosApp.security;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

// Prueba el token contra todos los verificadores activos (Firebase y, en desarrollo, los de prueba).
// Si no hay ninguno activo, ningún token es válido.
@Component
@RequiredArgsConstructor
public class AutenticadorDeTokens {

	private final List<VerificadorDeToken> verificadores;

	public Optional<TokenVerificado> verificar(String token) {
		return verificadores.stream()
				.map(verificador -> verificador.verificar(token))
				.flatMap(Optional::stream)
				.findFirst();
	}

}
