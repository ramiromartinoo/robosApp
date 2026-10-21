package com.proyectApp.robosApp.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import jakarta.servlet.http.HttpServletResponse;

// Los errores de seguridad ocurren antes de llegar a los controllers,
// así que se escriben a mano con el mismo formato que ErrorResponse.
final class RespuestasDeSeguridad {

	private RespuestasDeSeguridad() {
	}

	// el mensaje no debe contener comillas ni barras invertidas
	static void escribir(HttpServletResponse response, HttpStatus status, String mensaje) throws IOException {
		escribir(response, status, mensaje, "{}");
	}

	// Cuenta suspendida o baneada: además del mensaje, errores.cuenta dice cuál de los dos estados es,
	// para que la app muestre su pantalla en lugar de un error común
	static void escribirCuentaBloqueada(HttpServletResponse response, String estado, String mensaje)
			throws IOException {
		escribir(response, HttpStatus.FORBIDDEN, mensaje, "{\"cuenta\":\"" + estado + "\"}");
	}

	private static void escribir(HttpServletResponse response, HttpStatus status, String mensaje, String errores)
			throws IOException {
		response.setStatus(status.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.setCharacterEncoding(StandardCharsets.UTF_8.name());
		response.getWriter().write("{\"mensaje\":\"" + mensaje + "\",\"errores\":" + errores + "}");
	}

}
