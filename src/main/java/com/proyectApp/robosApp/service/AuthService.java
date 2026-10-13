package com.proyectApp.robosApp.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyectApp.robosApp.dto.SesionResponse;
import com.proyectApp.robosApp.entity.Usuario;
import com.proyectApp.robosApp.exception.NoAutorizadoException;
import com.proyectApp.robosApp.repository.UsuarioRepository;
import com.proyectApp.robosApp.security.AutenticadorDeTokens;
import com.proyectApp.robosApp.security.TokenVerificado;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

	private static final int LARGO_MAXIMO_NOMBRE = 50;
	private static final String NOMBRE_POR_DEFECTO = "Vecino";

	private final AutenticadorDeTokens autenticadorDeTokens;
	private final UsuarioRepository usuarioRepository;
	private final TerminosService terminosService;

	// Login y registro en un solo paso: la primera vez que alguien entra se le crea el usuario
	@Transactional
	public SesionResponse loginConGoogle(String idToken) {
		TokenVerificado token = autenticadorDeTokens.verificar(idToken)
				.orElseThrow(() -> new NoAutorizadoException("El token no es válido o está vencido"));

		Optional<Usuario> existente = usuarioRepository.findByFirebaseUid(token.uid());
		boolean usuarioNuevo = existente.isEmpty();
		Usuario usuario = usuarioNuevo ? usuarioRepository.save(nuevoUsuario(token)) : existente.get();
		return SesionResponse.desde(usuario, usuarioNuevo, terminosService.tienePendientes(usuario));
	}

	private Usuario nuevoUsuario(TokenVerificado token) {
		if (token.email() == null || token.email().isBlank()) {
			throw new NoAutorizadoException("La cuenta de Google no tiene un email asociado");
		}
		Usuario usuario = new Usuario();
		usuario.setFirebaseUid(token.uid());
		usuario.setEmail(token.email());
		usuario.setNombreVisible(nombreVisible(token.nombre()));
		return usuario;
	}

	private String nombreVisible(String nombre) {
		if (nombre == null || nombre.isBlank()) {
			return NOMBRE_POR_DEFECTO;
		}
		String limpio = nombre.trim();
		return limpio.length() > LARGO_MAXIMO_NOMBRE ? limpio.substring(0, LARGO_MAXIMO_NOMBRE) : limpio;
	}

}
