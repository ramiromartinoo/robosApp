package com.proyectApp.robosApp.security;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.proyectApp.robosApp.entity.EstadoUsuario;
import com.proyectApp.robosApp.entity.Usuario;
import com.proyectApp.robosApp.repository.UsuarioRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

// Lee "Authorization: Bearer <token>", busca al usuario y lo deja autenticado para el resto de la petición
@RequiredArgsConstructor
public class AutenticacionPorTokenFilter extends OncePerRequestFilter {

	private static final String PREFIJO = "Bearer ";

	private final AutenticadorDeTokens autenticadorDeTokens;
	private final UsuarioRepository usuarioRepository;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		String header = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (header != null && header.startsWith(PREFIJO)) {
			Optional<Usuario> usuario = autenticadorDeTokens.verificar(header.substring(PREFIJO.length()).trim())
					.flatMap(token -> usuarioRepository.findByFirebaseUid(token.uid()));

			if (usuario.isPresent()) {
				if (usuario.get().getEstado() != EstadoUsuario.ACTIVO) {
					RespuestasDeSeguridad.escribir(response, HttpStatus.FORBIDDEN,
							"Tu cuenta está suspendida o fue dada de baja");
					return;
				}
				autenticar(usuario.get());
			}
		}
		// sin token válido la petición sigue sin autenticar y Security responde 401 donde haga falta
		chain.doFilter(request, response);
	}

	private void autenticar(Usuario usuario) {
		var autoridades = List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name()));
		SecurityContextHolder.getContext().setAuthentication(
				UsernamePasswordAuthenticationToken.authenticated(usuario, null, autoridades));
	}

}
