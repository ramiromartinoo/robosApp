package com.proyectApp.robosApp.dto;

import com.proyectApp.robosApp.entity.TipoConfirmacion;

import jakarta.validation.constraints.NotNull;

public record ConfirmarRequest(

		@NotNull(message = "Hay que indicar si confirmás o negás el hecho")
		TipoConfirmacion tipo) {
}
