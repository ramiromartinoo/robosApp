package com.proyectApp.robosApp.config;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.proyectApp.robosApp.entity.Usuario;
import com.proyectApp.robosApp.exception.TerminosPendientesException;
import com.proyectApp.robosApp.service.TerminosService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

// Corta cualquier petición de un usuario que todavía no aceptó la versión vigente de los términos
@Component
@RequiredArgsConstructor
public class TerminosInterceptor implements HandlerInterceptor {

	private final TerminosService terminosService;

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
		Authentication autenticacion = SecurityContextHolder.getContext().getAuthentication();
		if (autenticacion != null && autenticacion.getPrincipal() instanceof Usuario usuario
				&& terminosService.tienePendientes(usuario)) {
			throw new TerminosPendientesException();
		}
		return true;
	}

}
