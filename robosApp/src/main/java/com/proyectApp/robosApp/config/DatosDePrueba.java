package com.proyectApp.robosApp.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.proyectApp.robosApp.entity.Rol;
import com.proyectApp.robosApp.entity.TerminosCondiciones;
import com.proyectApp.robosApp.entity.Usuario;
import com.proyectApp.robosApp.repository.TerminosCondicionesRepository;
import com.proyectApp.robosApp.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

// SOLO DESARROLLO: crea los usuarios de prueba y el borrador de términos al arrancar.
// Se activa únicamente con robosapp.seguridad.tokens-de-prueba=true (application-local.yaml).
@Component
@ConditionalOnProperty(name = "robosapp.seguridad.tokens-de-prueba", havingValue = "true")
@RequiredArgsConstructor
public class DatosDePrueba implements CommandLineRunner {

	public static final String UID_CLIENTE = "dev-usuario-prueba";
	public static final String UID_CLIENTE_2 = "dev-usuario-prueba-2";
	public static final String UID_CLIENTE_3 = "dev-usuario-prueba-3";
	public static final String UID_ADMIN = "dev-admin";

	private final UsuarioRepository usuarioRepository;
	private final TerminosCondicionesRepository terminosRepository;

	@Override
	public void run(String... args) throws IOException {
		crearSiNoExiste(UID_CLIENTE, "prueba@robosapp.local", "Vecino de prueba", Rol.CLIENTE);
		crearSiNoExiste(UID_CLIENTE_2, "prueba2@robosapp.local", "Vecina de prueba", Rol.CLIENTE);
		crearSiNoExiste(UID_CLIENTE_3, "prueba3@robosapp.local", "Vecino de prueba 3", Rol.CLIENTE);
		crearSiNoExiste(UID_ADMIN, "admin@robosapp.local", "Admin de prueba", Rol.ADMIN);
		publicarBorradorDeTerminosSiNoHayNinguno();
	}

	private void publicarBorradorDeTerminosSiNoHayNinguno() throws IOException {
		if (terminosRepository.count() == 0) {
			TerminosCondiciones terminos = new TerminosCondiciones();
			terminos.setVersion("0.1-borrador");
			terminos.setTexto(new ClassPathResource("terminos-borrador.txt").getContentAsString(StandardCharsets.UTF_8));
			terminosRepository.save(terminos);
		}
	}

	private void crearSiNoExiste(String uid, String email, String nombreVisible, Rol rol) {
		if (usuarioRepository.findByFirebaseUid(uid).isEmpty()) {
			Usuario usuario = new Usuario();
			usuario.setFirebaseUid(uid);
			usuario.setEmail(email);
			usuario.setNombreVisible(nombreVisible);
			usuario.setRol(rol);
			usuarioRepository.save(usuario);
		}
	}

}
