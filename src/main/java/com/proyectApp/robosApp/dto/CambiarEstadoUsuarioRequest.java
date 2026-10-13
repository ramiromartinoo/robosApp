package com.proyectApp.robosApp.dto;

import com.proyectApp.robosApp.entity.EstadoUsuario;

import jakarta.validation.constraints.NotNull;

public record CambiarEstadoUsuarioRequest(

		@NotNull(message = "El estado es obligatorio")
		EstadoUsuario estado) {
}
