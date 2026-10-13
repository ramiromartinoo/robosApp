package com.proyectApp.robosApp.dto;

import com.proyectApp.robosApp.entity.MotivoDenuncia;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DenunciarRequest(

		@NotNull(message = "El motivo es obligatorio")
		MotivoDenuncia motivo,

		@Size(max = 280, message = "El comentario no puede superar los 280 caracteres")
		String comentario) {
}
