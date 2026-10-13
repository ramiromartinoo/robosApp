package com.proyectApp.robosApp.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.proyectApp.robosApp.entity.Usuario;

// Único lugar que sabe quién es el usuario que hace la petición.
@Service
public class UsuarioActualService {

	// El usuario lo deja cargado AutenticacionPorTokenFilter
	public Usuario obtener() {
		Authentication autenticacion = SecurityContextHolder.getContext().getAuthentication();
		if (autenticacion == null || !(autenticacion.getPrincipal() instanceof Usuario usuario)) {
			throw new IllegalStateException("No hay un usuario autenticado");
		}
		return usuario;
	}

}
