package com.proyectApp.robosApp.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginGoogleRequest(

		// ID token que Firebase le entrega a la app después del login con Google
		@NotBlank(message = "El token es obligatorio")
		String idToken) {
}
