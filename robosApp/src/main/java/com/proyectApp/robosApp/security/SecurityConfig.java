package com.proyectApp.robosApp.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.proyectApp.robosApp.repository.UsuarioRepository;

@Configuration
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http, AutenticadorDeTokens autenticadorDeTokens,
			UsuarioRepository usuarioRepository) throws Exception {
		var filtro = new AutenticacionPorTokenFilter(autenticadorDeTokens, usuarioRepository);

		http
				// API REST sin sesiones ni formularios: no hace falta CSRF
				.csrf(csrf -> csrf.disable())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.addFilterBefore(filtro, UsernamePasswordAuthenticationFilter.class)
				.authorizeHttpRequests(auth -> auth
						// página de error interna de Spring: si se bloquea, cualquier error sale como 403
						.requestMatchers("/error").permitAll()
						// el login es justamente para quien todavía no está autenticado
						.requestMatchers("/auth/**").permitAll()
						// los términos se tienen que poder leer antes de registrarse
						.requestMatchers(HttpMethod.GET, "/terminos/vigentes").permitAll()
						.requestMatchers("/admin/**").hasRole("ADMIN")
						.anyRequest().authenticated())
				.exceptionHandling(errores -> errores
						.authenticationEntryPoint((request, response, ex) -> RespuestasDeSeguridad.escribir(
								response, HttpStatus.UNAUTHORIZED, "Tenés que iniciar sesión"))
						.accessDeniedHandler((request, response, ex) -> RespuestasDeSeguridad.escribir(
								response, HttpStatus.FORBIDDEN, "No tenés permiso para hacer esto")));
		return http.build();
	}

}
