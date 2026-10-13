package com.proyectApp.robosApp.dto;

import java.util.List;

// Un posteo denunciado con todas sus denuncias pendientes
public record DenunciasDePosteoResponse(
		AdminPosteoResponse posteo,
		int cantidadPendientes,
		List<DenunciaAdminResponse> denuncias) {
}
