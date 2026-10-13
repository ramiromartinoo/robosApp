package com.proyectApp.robosApp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PublicarTerminosRequest(

		@NotBlank(message = "La versión es obligatoria")
		@Size(max = 30, message = "La versión no puede superar los 30 caracteres")
		String version,

		@NotBlank(message = "El texto es obligatorio")
		String texto) {
}
