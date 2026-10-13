package com.proyectApp.robosApp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CrearSugerenciaRequest(

		@NotBlank(message = "La sugerencia no puede estar vacía")
		@Size(max = 500, message = "La sugerencia no puede superar los 500 caracteres")
		String texto) {
}
