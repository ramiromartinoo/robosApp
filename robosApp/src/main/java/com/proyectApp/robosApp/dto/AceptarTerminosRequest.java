package com.proyectApp.robosApp.dto;

import jakarta.validation.constraints.NotNull;

public record AceptarTerminosRequest(

		// id de la versión que el usuario leyó: evita aceptar a ciegas una versión que cambió mientras tanto
		@NotNull(message = "Falta indicar qué versión de los términos se acepta")
		Long terminosId) {
}
