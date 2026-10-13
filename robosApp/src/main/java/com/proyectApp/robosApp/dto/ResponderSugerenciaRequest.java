package com.proyectApp.robosApp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResponderSugerenciaRequest(

		@NotBlank(message = "La respuesta no puede estar vacía")
		@Size(max = 500, message = "La respuesta no puede superar los 500 caracteres")
		String respuesta) {
}
