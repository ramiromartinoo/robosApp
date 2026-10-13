package com.proyectApp.robosApp.security;

import java.util.Optional;

// Convierte el token del header Authorization en los datos del usuario.
// Hoy la única implementación es la de prueba; después se suma la de Firebase.
public interface VerificadorDeToken {

	// Optional vacío si el token no es válido
	Optional<TokenVerificado> verificar(String token);

}
