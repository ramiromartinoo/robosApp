package com.proyectApp.robosApp.dto;

import java.time.LocalDateTime;

import com.proyectApp.robosApp.entity.EstadoUsuario;
import com.proyectApp.robosApp.entity.Rol;
import com.proyectApp.robosApp.entity.Usuario;

// Vista de un usuario para el panel de administración (incluye el email: no usar en endpoints públicos)
public record UsuarioResponse(
		Long id,
		String email,
		String nombreVisible,
		Rol rol,
		EstadoUsuario estado,
		int advertencias,
		LocalDateTime fechaRegistro) {

	public static UsuarioResponse desde(Usuario usuario) {
		return new UsuarioResponse(
				usuario.getId(),
				usuario.getEmail(),
				usuario.getNombreVisible(),
				usuario.getRol(),
				usuario.getEstado(),
				usuario.getAdvertencias(),
				usuario.getFechaRegistro());
	}

}
