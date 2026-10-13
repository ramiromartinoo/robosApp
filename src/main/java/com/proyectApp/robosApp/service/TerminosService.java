package com.proyectApp.robosApp.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyectApp.robosApp.dto.AceptacionResponse;
import com.proyectApp.robosApp.dto.PublicarTerminosRequest;
import com.proyectApp.robosApp.dto.TerminosResponse;
import com.proyectApp.robosApp.entity.AceptacionTerminos;
import com.proyectApp.robosApp.entity.Rol;
import com.proyectApp.robosApp.entity.TerminosCondiciones;
import com.proyectApp.robosApp.entity.Usuario;
import com.proyectApp.robosApp.exception.ConflictoException;
import com.proyectApp.robosApp.exception.RecursoNoEncontradoException;
import com.proyectApp.robosApp.repository.AceptacionTerminosRepository;
import com.proyectApp.robosApp.repository.TerminosCondicionesRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TerminosService {

	private final TerminosCondicionesRepository terminosRepository;
	private final AceptacionTerminosRepository aceptacionRepository;

	@Transactional(readOnly = true)
	public TerminosResponse vigentes() {
		return terminosRepository.findFirstByOrderByFechaPublicacionDescIdDesc()
				.map(TerminosResponse::desde)
				.orElseThrow(() -> new RecursoNoEncontradoException("Todavía no hay términos y condiciones publicados"));
	}

	// Los administradores no quedan bloqueados: son quienes publican las versiones nuevas
	@Transactional(readOnly = true)
	public boolean tienePendientes(Usuario usuario) {
		if (usuario.getRol() == Rol.ADMIN) {
			return false;
		}
		return terminosRepository.findIdVigente()
				.map(idVigente -> !aceptacionRepository.existsByUsuarioIdAndTerminosId(usuario.getId(), idVigente))
				.orElse(false);
	}

	@Transactional
	public AceptacionResponse aceptar(Usuario usuario, Long terminosId, String ip) {
		TerminosCondiciones vigentes = terminosRepository.findFirstByOrderByFechaPublicacionDescIdDesc()
				.orElseThrow(() -> new RecursoNoEncontradoException("Todavía no hay términos y condiciones publicados"));
		if (!vigentes.getId().equals(terminosId)) {
			throw new ConflictoException("Esa versión de los términos ya no es la vigente");
		}

		// aceptar dos veces la misma versión no es un error: se devuelve la aceptación original
		Optional<AceptacionTerminos> previa = aceptacionRepository
				.findByUsuarioIdAndTerminosId(usuario.getId(), terminosId);
		if (previa.isPresent()) {
			return AceptacionResponse.desde(previa.get());
		}

		AceptacionTerminos aceptacion = new AceptacionTerminos();
		aceptacion.setUsuario(usuario);
		aceptacion.setTerminos(vigentes);
		aceptacion.setIpAddress(ip);
		return AceptacionResponse.desde(aceptacionRepository.save(aceptacion));
	}

	// Publicar una versión nueva obliga a todos los clientes a aceptar de nuevo
	@Transactional
	public TerminosResponse publicar(PublicarTerminosRequest request) {
		String version = request.version().trim();
		if (terminosRepository.existsByVersion(version)) {
			throw new ConflictoException("Ya existe una versión " + version);
		}
		TerminosCondiciones terminos = new TerminosCondiciones();
		terminos.setVersion(version);
		terminos.setTexto(request.texto().trim());
		return TerminosResponse.desde(terminosRepository.save(terminos));
	}

}
