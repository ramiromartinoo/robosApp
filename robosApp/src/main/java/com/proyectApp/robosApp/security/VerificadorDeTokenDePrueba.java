package com.proyectApp.robosApp.security;

import java.util.Map;
import java.util.Optional;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.proyectApp.robosApp.config.DatosDePrueba;

// SOLO DESARROLLO: tokens fijos para probar sin Firebase.
// Se activa únicamente con robosapp.seguridad.tokens-de-prueba=true (application-local.yaml).
@Component
@Order(1) // antes que Firebase: evita mandarle a validar un token que sabemos que es de prueba
@ConditionalOnProperty(name = "robosapp.seguridad.tokens-de-prueba", havingValue = "true")
public class VerificadorDeTokenDePrueba implements VerificadorDeToken {

	private static final Map<String, String> UID_POR_TOKEN = Map.of(
			"dev-cliente", DatosDePrueba.UID_CLIENTE,
			"dev-cliente-2", DatosDePrueba.UID_CLIENTE_2,
			"dev-cliente-3", DatosDePrueba.UID_CLIENTE_3,
			"dev-admin", DatosDePrueba.UID_ADMIN);

	@Override
	public Optional<TokenVerificado> verificar(String token) {
		return Optional.ofNullable(UID_POR_TOKEN.get(token))
				.map(uid -> new TokenVerificado(uid, null, null));
	}

}
