package com.proyectApp.robosApp.dto;

import com.proyectApp.robosApp.entity.EstadoUsuario;
import com.proyectApp.robosApp.entity.Rol;
import com.proyectApp.robosApp.entity.Usuario;

// Datos del propio usuario que la app necesita después del login
public record SesionResponse(
		Long id,
		String email,
		String nombreVisible,
		Rol rol,
		EstadoUsuario estado,
		boolean usuarioNuevo,
		// true: hay que mostrarle los términos vigentes y pedirle que los acepte
		boolean terminosPendientes) {

	public static SesionResponse desde(Usuario usuario, boolean usuarioNuevo, boolean terminosPendientes) {
		return new SesionResponse(
				usuario.getId(),
				usuario.getEmail(),
				usuario.getNombreVisible(),
				usuario.getRol(),
				usuario.getEstado(),
				usuarioNuevo,
				terminosPendientes);
	}

}
